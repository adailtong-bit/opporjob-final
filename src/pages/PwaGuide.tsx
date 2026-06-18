import {
  Smartphone,
  Share,
  MoreVertical,
  PlusSquare,
  ArrowDownToLine,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function PwaGuide() {
  const { t } = useLanguageStore()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {t('pwa.guide.title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t('pwa.guide.desc')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Guide */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              {t('pwa.guide.android.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-700 dark:text-green-500 font-bold shrink-0 leading-none">
                1
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  {t('pwa.guide.android.step1.title')}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {t('pwa.guide.android.step1.desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-700 dark:text-green-500 font-bold shrink-0 leading-none">
                2
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  {t('pwa.guide.android.step2.title')}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  {t('pwa.guide.android.step2.desc')}
                  <MoreVertical className="w-4 h-4 inline text-slate-900 dark:text-slate-100 ml-1" />
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-700 dark:text-green-500 font-bold shrink-0 leading-none">
                3
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  {t('pwa.guide.android.step3.title')}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  {t('pwa.guide.android.step3.desc')}
                  <ArrowDownToLine className="w-4 h-4 inline text-slate-900 dark:text-slate-100 ml-1" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* iOS Guide */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              {t('pwa.guide.ios.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-500 font-bold shrink-0 leading-none">
                1
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  {t('pwa.guide.ios.step1.title')}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {t('pwa.guide.ios.step1.desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-500 font-bold shrink-0 leading-none">
                2
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  {t('pwa.guide.ios.step2.title')}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  {t('pwa.guide.ios.step2.desc')}
                  <Share className="w-4 h-4 inline text-blue-600 ml-1" />
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-500 font-bold shrink-0 leading-none">
                3
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  {t('pwa.guide.ios.step3.title')}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  {t('pwa.guide.ios.step3.desc')}
                  <PlusSquare className="w-4 h-4 inline text-slate-900 dark:text-slate-100 ml-1" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
