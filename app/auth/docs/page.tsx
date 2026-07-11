"use client";

export default function AuthDocsPage() {

  return (
    <div className="h-screen w-full flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="flex flex-col gap-4 max-w-5xl">
        <h1 className="text-6xl font-bold mb-4">Mira Auth Documentation</h1>
        <p className="text-lg flex gap-1 items-center">
          1. the auth page will redirect to Mira Auth with a redirect URL(this should be the url to your app&apos;s auth page). After successful login, Mira Auth will redirect back to the provided URL. <a href="https://github.com/Mira-Studios/mira-website/blob/master/app/auth/test/page.tsx" target="_blank" rel="noopener noreferrer"><p className="text-blue-500 hover:underline">test/page.tsx</p></a>
        </p>
        <p className="text-lg flex gap-1">
          2. You will need the session api route for your app. you will need to connect it to your own database. <a href="https://github.com/Mira-Studios/mira-website/blob/master/app/api/auth/test-session/route.ts" target="_blank" rel="noopener noreferrer"><p className="text-blue-500 hover:underline">test-session/route.ts</p></a>
        </p>
        <p className="text-lg">
          3. You will need an api key for your app. it is used by the session api route to verify the login. <a href="https://mira.fatalmistake02.com/apikey" target="_blank" rel="noopener noreferrer"><p className="text-blue-500 hover:underline">https://mira.fatalmistake02.com/apikey</p></a>
        </p>
        <p className="text-lg flex gap-1">
          4. the auth helper to know who the user is. <a  href="https://github.com/Mira-Studios/mira-website/blob/master/lib/auth.ts" target="_blank" rel="noopener noreferrer"><p className="text-blue-500 hover:underline">auth.ts</p></a>
        </p>
        <p className="text-lg flex gap-1">
          5. then you can check user data <a href="https://github.com/Mira-Studios/mira-website/blob/master/app/auth/test/authenticated/page.tsx" target="_blank" rel="noopener noreferrer"><p className="text-blue-500 hover:underline">test/authenticated/page.tsx</p></a>
        </p>
        <p className="text-lg flex gap-1">
          6. then you can control what data users can access <a href="https://github.com/Mira-Studios/mira-website/blob/master/app/api/test-get-data/[id]/route.ts" target="_blank" rel="noopener noreferrer"><p className="text-blue-500 hover:underline">test-get-data/[id]/route.ts</p></a>
        </p>
      </div>
    </div>
  );
}
