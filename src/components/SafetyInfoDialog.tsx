import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Plane, AlertCircle } from "lucide-react";

export function SafetyInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="w-4 h-4" />
          Safety Information
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Flying Taxi Safety Information
          </DialogTitle>
          <DialogDescription>
            Important information about your flying taxi journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Plane className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Autonomous Operation</h4>
                <p className="text-sm text-muted-foreground">
                  Our flying taxis are fully autonomous and operated by advanced AI systems. 
                  Each vehicle undergoes rigorous safety checks before every flight.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Safe Landing Zones</h4>
                <p className="text-sm text-muted-foreground">
                  All pickup and drop-off locations are pre-approved safe landing zones. 
                  Please proceed to the designated area when your taxi arrives.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Your Responsibilities</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Arrive at pickup location 2 minutes before taxi arrival</li>
                  <li>Keep a safe distance during landing and takeoff</li>
                  <li>Follow all in-flight safety instructions displayed in the cabin</li>
                  <li>Remain seated with seatbelt fastened during the entire journey</li>
                  <li>Do not attempt to interfere with automated systems</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              By booking a flying taxi, you acknowledge that you have read and understood 
              these safety guidelines. For emergencies, contact our 24/7 support line.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
