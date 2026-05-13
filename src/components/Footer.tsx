import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const defaultFooterData = {
  aboutUs:
    'We are a platform dedicated to bringing the best deals and opportunities to our users.',
  ourCompany:
    'OPPORJOB is a technology company focused on connecting local businesses with consumers.',
  ourMission:
    'Our mission is to empower local commerce and help users save money on their everyday purchases.',
  contactEmail: 'contact@opporjob.com',
  contactPhone: '+1 234 567 8900',
  contactAddress: '123 Tech Street, Suite 456, City, Country',
  copyright: '© 2026 OPPORJOB. All rights reserved.',
}

export function Footer() {
  const [data, setData] = useState<any>(defaultFooterData)

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const { data: res, error } = await supabase
          .from('site_settings' as any)
          .select('value')
          .eq('key', 'footer')
          .single()

        if (!error && res?.value) {
          setData(res.value)
        }
      } catch (err) {
        console.error('Error fetching footer data:', err)
      }
    }
    fetchFooter()
  }, [])

  return (
    <footer className="bg-[#0f172a] text-slate-300 py-12 px-6 md:px-12 w-full mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Column 1 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">About Us</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {data.aboutUs}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Our Mission</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {data.ourMission}
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Our Company</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {data.ourCompany}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Contact Us</h3>
              <div className="text-sm space-y-2 text-slate-400 whitespace-pre-line">
                {`Email: ${data.contactEmail}\nPhone: ${data.contactPhone}\nAddress: ${data.contactAddress}`}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center md:text-left text-sm text-slate-500">
          <p>{data.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
