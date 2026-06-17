import {
  Smartphone,
  Share,
  MoreVertical,
  PlusSquare,
  ArrowDownToLine,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PwaGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Instale nosso Aplicativo
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tenha a OPPORJOB sempre à mão, direto na tela inicial do seu celular.
          Não é necessário baixar da loja de aplicativos!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Guide */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              Usuários Android
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-700 dark:text-green-500 font-bold shrink-0 leading-none">
                1
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  Abra o Google Chrome
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Acesse nosso site utilizando o navegador Chrome no seu celular
                  Android.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-700 dark:text-green-500 font-bold shrink-0 leading-none">
                2
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  Toque no menu de opções
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  Localize e toque no ícone de três pontos{' '}
                  <MoreVertical className="w-4 h-4 inline text-slate-900 dark:text-slate-100" />{' '}
                  no canto superior direito.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-700 dark:text-green-500 font-bold shrink-0 leading-none">
                3
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  Instalar aplicativo
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  Selecione a opção <strong>"Instalar aplicativo"</strong> ou{' '}
                  <strong>"Adicionar à tela inicial"</strong>{' '}
                  <ArrowDownToLine className="w-4 h-4 inline text-slate-900 dark:text-slate-100" />
                  . Confirme a instalação para concluir.
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
              Usuários iOS (iPhone)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-500 font-bold shrink-0 leading-none">
                1
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  Abra o Safari
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Acesse nosso site utilizando o navegador nativo Safari no seu
                  iPhone.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-500 font-bold shrink-0 leading-none">
                2
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  Toque em Compartilhar
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  Localize e toque no ícone de Compartilhar{' '}
                  <Share className="w-4 h-4 inline text-blue-600" /> (quadrado
                  com a seta para cima) na barra inferior.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-500 font-bold shrink-0 leading-none">
                3
              </div>
              <div>
                <p className="font-medium text-lg text-slate-900 dark:text-slate-100">
                  Adicionar à Tela de Início
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center flex-wrap gap-1">
                  Role a lista de opções para baixo e selecione{' '}
                  <strong>"Adicionar à Tela de Início"</strong>{' '}
                  <PlusSquare className="w-4 h-4 inline text-slate-900 dark:text-slate-100" />
                  . Confirme tocando em "Adicionar" no canto superior.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
