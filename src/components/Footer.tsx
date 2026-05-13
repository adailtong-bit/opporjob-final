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
    <footer className="bg-[#0f172a] text-slate-300 py-4 md:py-5 px-4 md:px-8 w-full mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-5">
          {/* Column 1 */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">About Us</h3>
            <p className="text-[13px] leading-snug text-slate-400">
              {data.aboutUs}
            </p>
          </div>

          {/* Column 2 */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Our Mission</h3>
            <p className="text-[13px] leading-snug text-slate-400">
              {data.ourMission}
            </p>
          </div>

          {/* Column 3 */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Our Company</h3>
            <p className="text-[13px] leading-snug text-slate-400">
              {data.ourCompany}
            </p>
          </div>

          {/* Column 4 */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Contact Us</h3>
            <div className="text-[13px] space-y-0.5 text-slate-400 whitespace-pre-line leading-snug">
              {`Email: ${data.contactEmail}\nPhone: ${data.contactPhone}\nAddress: ${data.contactAddress}`}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center md:text-left text-xs text-slate-500">
          <p>{data.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
