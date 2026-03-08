import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side: Image */}
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="w-full h-full bg-black/30 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h1 className="text-5xl font-serif font-black mb-6">Welcome Back</h1>
            <p className="text-xl font-medium leading-relaxed">
              Log in to order your favorite artisanal treats and track your sweet deliveries.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center bg-[#FCF9F2] p-4 lg:p-12">
        <SignIn path="/login" />
      </div>
    </div>
  );
}
