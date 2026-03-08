import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Right side: Image (Swapped for variety) */}
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center order-2"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="w-full h-full bg-black/40 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h1 className="text-5xl font-serif font-black mb-6">Join the Family</h1>
            <p className="text-xl font-medium leading-relaxed">
              Create an account to discover our artisanal collection and get fresh treats delivered to your door.
            </p>
          </div>
        </div>
      </div>

      {/* Left side: Form */}
      <div className="flex-1 flex items-center justify-center bg-[#FCF9F2] p-4 lg:p-12 order-1">
        <SignUp path="/register" />
      </div>
    </div>
  );
}
