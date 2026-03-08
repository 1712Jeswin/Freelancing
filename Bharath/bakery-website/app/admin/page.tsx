import { auth } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const { sessionClaims } = await auth();

  // Simple Admin Role Check (Needs Clerk Metadata setup)
  // const isAdmin = sessionClaims?.metadata?.role === "admin";
  // if (!isAdmin) redirect("/dashboard");

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <h1 className="text-4xl font-serif font-black mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Manage Products", count: "12 Items", link: "admin/products" },
          { title: "Active Orders", count: "5 New", link: "admin/orders" },
          { title: "Customers", count: "48 Users", link: "admin/users" },
        ].map((item) => (
          <div key={item.title} className="p-8 rounded-[2.5rem] bg-white shadow-xl border border-neutral-100 hover:shadow-2xl transition-all">
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-primary font-serif font-black text-2xl mb-4">{item.count}</p>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest cursor-not-allowed">
              Coming Soon &rarr;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
