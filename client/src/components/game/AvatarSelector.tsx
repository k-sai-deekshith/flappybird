import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import type { BirdStyle } from "./Bird";

const BIRD_STYLES = [
  { id: 'cowboy' as const, name: 'Cowboy Bird', colors: { body: '#f4ce42', hat: '#8b4513', bandana: '#cd5c5c' } },
  { id: 'sheriff' as const, name: 'Sheriff Bird', colors: { body: '#e6b800', hat: '#654321', bandana: '#483d8b' } },
  { id: 'bandit' as const, name: 'Bandit Bird', colors: { body: '#4a4a4a', hat: '#1a1a1a', bandana: '#8b0000' } },
  { id: 'prospector' as const, name: 'Prospector Bird', colors: { body: '#deb887', hat: '#966f33', bandana: '#daa520' } },
];

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle?: BirdStyle;
}

export default function AvatarSelector({ open, onOpenChange, currentStyle = 'cowboy' }: AvatarSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<BirdStyle>(currentStyle);
  const { updateAvatar } = useUser();

  const handleSubmit = async () => {
    try {
      await updateAvatar(selectedStyle);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update avatar:", error);
    }
  };

  const renderBirdPreview = (style: typeof BIRD_STYLES[0]) => {
    return (
      <div className="w-20 h-20 relative">
        <div
          className="absolute w-16 h-12 rounded"
          style={{ backgroundColor: style.colors.body, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="absolute w-12 h-4 rounded-sm -top-4 left-1"
            style={{ backgroundColor: style.colors.hat }}
          />
          <div
            className="absolute w-16 h-3 rounded-sm"
            style={{ backgroundColor: style.colors.bandana, top: '25%' }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-black"
            style={{ top: '30%', left: '75%' }}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Bird Style</DialogTitle>
        </DialogHeader>
        <RadioGroup
          value={selectedStyle}
          onValueChange={(value) => setSelectedStyle(value as BirdStyle)}
          className="grid grid-cols-2 gap-4 py-4"
        >
          {BIRD_STYLES.map((style) => (
            <div
              key={style.id}
              className="flex flex-col items-center space-y-2 p-4 rounded-lg border cursor-pointer hover:bg-accent"
              onClick={() => setSelectedStyle(style.id)}
            >
              {renderBirdPreview(style)}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={style.id} id={style.id} />
                <Label htmlFor={style.id}>{style.name}</Label>
              </div>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Choice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}