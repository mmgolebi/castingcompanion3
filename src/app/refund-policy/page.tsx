import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Casting Companion',
  description: 'Learn about our 14-day trial, refund policy, and how to cancel your subscription.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Refund & Cancellation Policy
          </h1>
          
          <p className="text-lg text-gray-700 mb-8">
            At Casting Companion, we want you to feel confident using our service. 
            Please read our policy carefully:
          </p>

          {/* Trial Period & Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Trial Period & Refunds
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>All new users begin with a 14-day trial period.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>During this trial window, you may cancel and request a full refund of your subscription payment.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Refund requests must be submitted within this 14-day window.</span>
              </li>
            </ul>
          </section>

          {/* Subscription Billing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Subscription Billing
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>After the trial period ends, you will be automatically enrolled in our monthly subscription of $39.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Subscription charges are non-refundable once the trial has ended.</span>
              </li>
            </ul>
          </section>

          {/* Cancel Anytime */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cancel Anytime
            </h2>
            <ul className="space-y-3 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>You may cancel your subscription at any time to prevent future charges.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>
                  Cancellations can be made by:
                  <ul className="ml-6 mt-2 space-y-2">
                    <li>• In your account: Go to Settings → Billing → Cancel Subscription</li>
                    <li>• Email us at <a href="mailto:info@castingcompanion.com" className="text-purple-600 hover:underline">info@castingcompanion.com</a></li>
                    <li>• Call us at <a href="tel:+18449894574" className="text-purple-600 hover:underline">(844) 989-4574</a></li>
                  </ul>
                </span>
              </li>
            </ul>
            <p className="text-gray-600 italic">
              We recommend keeping a copy of your cancellation confirmation for your records.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-purple-50 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Questions?
            </h3>
            <p className="text-gray-700">
              If you have any questions about our refund or cancellation policy, please contact us:
            </p>
            <div className="mt-3 space-y-1 text-gray-700">
              <p>Email: <a href="mailto:info@castingcompanion.com" className="text-purple-600 hover:underline">info@castingcompanion.com</a></p>
              <p>Phone: <a href="tel:+18449894574" className="text-purple-600 hover:underline">(844) 989-4574</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
