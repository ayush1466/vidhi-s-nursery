import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: MapPin,
      label: "Visit Us",
      text: "42 Garden Lane, Satellite, Ahmedabad, Gujarat 380015",
    },
    {
      icon: Phone,
      label: "Call Us",
      text: "+91 98765 43210",
    },
    {
      icon: Mail,
      label: "Email Us",
      text: "hello@vidhinursery.in",
    },
    {
      icon: Clock,
      label: "Working Hours",
      text: "Mon–Sat: 9 AM – 7 PM\nSunday: 10 AM – 5 PM",
    },
  ];

  return (
    <div className="min-h-screen bg-cream pt-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="bg-forest-800 w-full py-14 text-center">
        <h1 className="font-display text-4xl text-white mb-2">
          Get in Touch
        </h1>
        <p className="font-body text-forest-300">
          We'd love to hear from you 🌿
        </p>
      </div>

      {/* Contact Card */}
      <div className="max-w-3xl w-full px-6 py-14">
        <div className="bg-white rounded-3xl shadow-xl p-10">

          <h2 className="font-display text-2xl text-bark text-center mb-10">
            Contact Information
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {contactInfo.map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-forest-50 transition"
              >
                <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-forest-600" />
                </div>

                <div>
                  <p className="font-display text-bark">{label}</p>
                  <p className="font-body text-sm text-bark/60 whitespace-pre-line">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}