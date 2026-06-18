import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>Lumen</h1>
      {user ? (
        <p>
          Signed in as{" "}
          <strong>{user.primaryEmailAddress?.emailAddress ?? "your account"}</strong>.
          Sign-in is working — the study workspace UI gets ported in Week 1, Step 4.
        </p>
      ) : (
        <p>
          You are <strong>not signed in</strong>. Use the Sign in / Sign up
          buttons above to create an account.
        </p>
      )}
    </div>
  );
}
