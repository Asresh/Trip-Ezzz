import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import TripInputForm from "@/components/trip/trip-input-form";

export default function TripInputPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <TripInputForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
