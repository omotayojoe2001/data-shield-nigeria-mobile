
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User authentication error:", userError);
      throw new Error("User not authenticated");
    }

    const { amount, email, type, callback_url } = await req.json();

    if (!amount || !email) {
      throw new Error("Amount and email are required");
    }

    console.log("Initializing payment for user:", user.id, {
      amount,
      email,
      type,
      callback_url
    });

    // Use the Paystack secret key
    const paystackSecretKey = "sk_test_3b4296afe558d06a3166d41b24283bdf5d9afee7";
    
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "NGN",
        callback_url: callback_url || `${req.headers.get("origin")}/?payment=success&amount=${amount/100}`,
        metadata: {
          user_id: user.id,
          type: type || 'topup'
        }
      }),
    });

    const paystackData = await paystackResponse.json();
    
    console.log("Paystack initialization response:", {
      status: paystackData.status,
      message: paystackData.message,
      reference: paystackData.data?.reference
    });

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Payment initialization failed");
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment initialization error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
