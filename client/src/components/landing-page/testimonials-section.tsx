export default function TestimonialsSection() {
  const testimonials = [
    {
      content: "Trip Ez saved me hours of planning for my trip to Japan. The AI suggested hidden gems that made my journey truly unforgettable!",
      author: "Sarah K.",
      location: "Tokyo, Japan",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/12.jpg"
    },
    {
      content: "The family-friendly itinerary for Rome was perfect. Every activity kept the kids engaged, and the restaurant suggestions were spot on!",
      author: "David M.",
      location: "Rome, Italy",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      content: "As a solo traveler with a tight budget, Trip Ez created an amazing adventure in Thailand without breaking the bank. Worth every penny!",
      author: "Emma L.",
      location: "Bangkok, Thailand",
      rating: 4.5,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">What Our Travelers Say</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Join thousands of savvy travelers who love planning with Trip Ez
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                  {testimonial.rating % 1 !== 0 && (
                    <i className="fas fa-star-half-alt"></i>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{`"${testimonial.content}"`}</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary-100 flex-shrink-0"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
