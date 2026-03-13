export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Contact Us
        </h1>
        <p className="mt-4 text-gray-600">
          Have questions? We&apos;d love to hear from you. Send us a message and
          we&apos;ll respond as soon as possible.
        </p>

        <form className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <select
              id="subject"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
            >
              <option>General Inquiry</option>
              <option>Driver Support</option>
              <option>Shipper Support</option>
              <option>Billing Question</option>
              <option>Report an Issue</option>
              <option>Partnership Opportunity</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
              placeholder="How can we help?"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
          >
            Send Message
          </button>
        </form>

        <div className="mt-12 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Other Ways to Reach Us
          </h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-900">Email:</span>{" "}
              support@sprintcargo.com
            </p>
            <p>
              <span className="font-medium text-gray-900">Hours:</span>{" "}
              Monday – Friday, 9 AM – 6 PM EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
