/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ethers } from "ethers";

export interface Env {
  COFFEE_MENU: KVNamespace;
  SEPOLIA_RPC_URL: string;
  CAFE_PAYMENT_ADDRESS: string;
}

export default
{
  async fetch(req:Request, env:Env) : Promise<Response>
  {
      const url = new URL(req.url);

      if(req.method === "OPTIONS")
      {
         return new Response(null,
          {
            headers:{
              "Access-Control-Allow-Origin":"*",
              "Access-Control-Allow-Methods":"GET, POST, PUT, OPTIONS",
              "Access-Control-Allow-Headers":"Content-type"
            },
          });
      }

      //Test Route
      if(url.pathname === "/" && req.method === "GET")
      {
        return new Response("Hello From Cloudfare Workers",
          {
            status: 200,
            headers:{
              "Content-type":"application/json",
              "Access-Control-Allow-Origin":"*"
            }
          }
        )
      }

      // Routes
      if(url.pathname === "/api/menu" && req.method === "GET")
      {
        try 
        {
          const menuData = await env.COFFEE_MENU.get("full_menu");

          if(!menuData)
          {
            return new Response(JSON.stringify({error: "Menu not Found"}),
              {
                status: 404,
                headers:{
                  "Content-type":"application/json",
                  "Access-Control-Allow-Origin":"*"
                }
              }
            )
          }

          return new Response( menuData,{
            status:200,
            headers:{
              "Content-type":"application/json",
              "Access-Control-Allow-Origin":"*"
            }
          })
        } 
        catch (error) {
          return new Response(JSON.stringify({error: "Internal Server Error"}),
            {
              status: 500,
              headers:{
                "Content-type":"application/json",
                "Access-Control-Allow-Origin":"*"
              }
            }
          )
        }
      }

      else if(url.pathname === "/api/menu/update" && (req.method === "POST" || req.method === "PUT"))
      {
        try 
        {
          const body:any = await req.json();

          const updatedMenu = body.updatedMenu;
          const auth = body.auth;

          const fiveMinutes = 5 * 60 * 1000;
          if(Date.now() - auth.timestamp > fiveMinutes)
          {
            return new Response("Signature expired", 
              { 
                status: 401,
                headers: { "Access-Control-Allow-Origin": "*" } 
              });
          }

          const recoveredAddress = ethers.verifyMessage(auth.message,auth.signature);

          const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);
          const contract = new ethers.Contract(
            env.CAFE_PAYMENT_ADDRESS,
            ["function owner() view returns (address)"],
            provider
          );

          const realOwner = await contract.owner();

          if (recoveredAddress.toLowerCase() !== realOwner.toLowerCase()) {
            return new Response("Unauthorized: Not the contract owner", 
              { 
                status: 403,
                headers: { "Access-Control-Allow-Origin": "*" }
              });
          }

          if (!updatedMenu) {
            return new Response(JSON.stringify({ error: "Missing updatedMenu payload" }), {
             status: 400,
             headers: {
               "Content-Type": "application/json",
               "Access-Control-Allow-Origin": "*",
             },
           });
          }

          await env.COFFEE_MENU.put("full_menu", JSON.stringify(updatedMenu));

          return new Response(JSON.stringify({ success: true, message: "Menu Updated Successfully" }), {
           status: 200,
           headers: {
             "Content-Type": "application/json",
             "Access-Control-Allow-Origin": "*",
           },
          });

        } 
        catch (error) {
          return new Response(JSON.stringify({error: "Internal Server Error"}),
            {
              status: 500,
              headers:{
                "Content-type":"application/json",
                "Access-Control-Allow-Origin":"*"
              }
            }
          )
        }
      }


      //Fall back Route
      return new Response(JSON.stringify({error: "Route Not Found"}),
      {
        status: 404,
        headers:{
          "Content-type":"application/json",
          "Access-Control-Allow-Origin":"*"
        }
      }
    ) 
  }
}
