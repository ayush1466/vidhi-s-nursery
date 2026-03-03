import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success('Message sent! We\'ll get back to you within 24 hours. 🌿')
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="bg-forest-800 py-14 text-center">
        <h1 className="font-display text-4xl text-white mb-2">Get in Touch</h1>
        <p className="font-body text-forest-300">We'd love to hear from you 🌿</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10">
        {/* Info */}
        <div>
          <h2 className="font-display text-2xl text-bark mb-6">Contact Info</h2>
          <div className="space-y-5">
            {[
              { icon: MapPin, label: 'Visit Us', text: '42 Garden Lane, Satellite, Ahmedabad, Gujarat 380015' },
              { icon: Phone, label: 'Call Us', text: '+91 98765 43210' },
              { icon: Mail, label: 'Email Us', text: 'hello@vidhinursery.in' },
              { icon: Clock, label: 'Working Hours', text: 'Mon–Sat: 9 AM – 7 PM\nSunday: 10 AM – 5 PM' },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 bg-forest-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="font-display text-sm text-bark">{label}</p>
                  <p className="font-body text-sm text-bark/60 whitespace-pre-line">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-7 shadow-sm space-y-4">
            <h2 className="font-display text-2xl text-bark mb-2">Send a Message</h2>
            {[
              { key: 'name', label: 'Name', type: 'text', placeholder: 'Your Name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              { key: 'subject', label: 'Subject', type: 'text', placeholder: 'How can we help?' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-forest-100 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
                />
              </div>
            ))}
            <div>
              <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Tell us more..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full border border-forest-100 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-forest-600 text-white font-body py-3.5 rounded-full hover:bg-forest-700 transition-colors disabled:opacity-70"
            >
              {sending ? 'Sending...' : 'Send Message 🌿'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
