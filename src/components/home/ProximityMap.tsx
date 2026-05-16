import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Navigation, Star, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'

const MOCK_PROS = [
  {
    id: 'exec-1',
    name: 'João Freelancer',
    role: 'Desenvolvedor Backend',
    rating: 4.8,
    distance: '1.2 km',
    verified: true,
    online: true,
    top: '30%',
    left: '40%',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-1',
  },
  {
    id: 'sug-1',
    name: 'Ana Engenheira',
    role: 'Engenheira Civil',
    rating: 5.0,
    distance: '2.5 km',
    verified: true,
    online: false,
    top: '60%',
    left: '65%',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=ana',
  },
  {
    id: 'sug-2',
    name: 'Roberto Construtor',
    role: 'Pedreiro',
    rating: 4.6,
    distance: '0.8 km',
    verified: false,
    online: true,
    top: '45%',
    left: '25%',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=roberto',
  },
]

export function ProximityMap() {
  const [selectedPro, setSelectedPro] = useState<(typeof MOCK_PROS)[0] | null>(
    null,
  )

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-0 relative h-[400px] bg-slate-100 flex items-center justify-center">
        {/* Fake Map Background */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23f1f5f9'/%3E%3Cpath d='M20 20h60v60H20z' fill='%23e2e8f0'/%3E%3Cpath d='M40 0v100M0 40h100' stroke='%23cbd5e1' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />

        {/* Current User Location */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 animate-pulse" />
          <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute animate-ping" />
        </div>

        {/* Pro Pins */}
        {MOCK_PROS.map((pro) => (
          <div
            key={pro.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: pro.top, left: pro.left }}
            onClick={() => setSelectedPro(pro)}
          >
            <div className="relative">
              <MapPin
                className={`h-8 w-8 ${pro.verified ? 'text-blue-600' : 'text-slate-600'} drop-shadow-md group-hover:scale-110 transition-transform`}
              />
              {pro.online && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
          </div>
        ))}

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md bg-white hover:bg-slate-50"
          >
            <Navigation className="h-4 w-4 text-slate-700" />
          </Button>
        </div>

        {/* Selected Pro Info Card */}
        {selectedPro && (
          <div className="absolute bottom-4 left-4 right-16 md:right-auto md:w-80 animate-in slide-in-from-bottom-4">
            <Card className="shadow-lg border-primary/20">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={selectedPro.avatar} />
                      <AvatarFallback>
                        {selectedPro.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedPro.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm truncate pr-2">
                        {selectedPro.name}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-xs py-0 h-5"
                      >
                        <Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                        {selectedPro.rating}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <span className="truncate">{selectedPro.role}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">
                        {selectedPro.distance}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedPro.verified && (
                        <Badge
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 text-[10px] h-5 py-0 px-1.5"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        className="h-6 text-xs px-2 ml-auto"
                        asChild
                      >
                        <Link to={`/profile/${selectedPro.id}`}>
                          Ver Perfil
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
