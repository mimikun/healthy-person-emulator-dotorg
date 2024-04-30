import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { commitSession, getSession } from "~/modules/session.server";
import { createClient } from '@supabase/supabase-js';


import type {
    Session,
} from '@supabase/supabase-js';
import { prisma } from "~/modules/db.server";

export async function loader () {
    return json({ ENV : {
        SUPABASE_URL_CLIENT : process.env.SUPABASE_URL_CLIENT,
        SUPABASE_ANON_KEY_CLIENT : process.env.SUPABASE_ANON_KEY_CLIENT,
    } });
}

export default function AuthCallBack() {
    const { ENV } = useLoaderData<typeof loader>();
    if (!ENV.SUPABASE_URL_CLIENT || !ENV.SUPABASE_ANON_KEY_CLIENT) {
        throw new Error('Supabase URL or Supabase Anon Key is missing.');
    }
    const supabase = createClient(ENV.SUPABASE_URL_CLIENT, ENV.SUPABASE_ANON_KEY_CLIENT)
    const fetcher = useFetcher();
    const searchParams = useSearchParams();
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            const formData = new FormData();
            formData.append("session", JSON.stringify(session));
            formData.append("event", event);
            fetcher.submit(formData, { method: "post" });
        }
        );
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [fetcher, searchParams, supabase.auth]);

    return null;
}

export async function action({ request } : ActionFunctionArgs) {
    const formData = await request.formData();
    const formDataSession = formData.get("session") as string | null;
    const event = formData.get("event") as string | null;
    const SupabaseSession: Session = JSON.parse(formDataSession!);
    if (!formDataSession || !event) {
        return redirect("/login");
    }
    console.log("event", event)
    console.log("SupabaseSession", SupabaseSession)

    const session = await getSession(request.headers.get("Cookie"));
    const {
        access_token : accessToken,
        refresh_token : refreshToken,
        user,
    } = SupabaseSession;
    session.set("accessToken", accessToken);
    session.set("refreshToken", refreshToken);
    session.set("userId", user.id);
    if (event == "signup"){
        if (!user.id || !user.email) {
            throw new Error("User ID or Email is missing.");
        }
        try {
            await prisma.userProfiles.create({
            data: {
                userId: user.id,
                userEmail: user.email,
            },
            });
        } catch (error) {
            throw new Error(`Failed to create user profile: ${error}`);
        }
        return redirect("/userVerified",{
            headers: {
                "Set-Cookie": await commitSession(session)
            }
        })
    }
    else if (event == "resetpassword"){
        return redirect("/resetPassword", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    }
}
