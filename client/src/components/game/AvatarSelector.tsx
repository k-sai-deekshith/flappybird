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
import { useMutation } from "@tanstack/react-query";

const BIRD_STYLES = [
  { id: 'cowboy', name: 'Cowboy Bird', colors: { body: '#f4ce42', hat: '#8b4513', bandana: '#cd5c5c' } },
  { id: 'sheriff', name: 'Sheriff Bird', colors: { body: '#e6b800', hat: '#654321', bandana: '#483d8b' } },
  { id: 'bandit', name: 'Bandit Bird', colors: { body: '#4a4a4a', hat: '#1a1a1a', bandana: '#8b0000' } },
  { id: 'prospector', name: 'Prospector Bird', colors: { body: '#deb887', hat: '#966f33', bandana: '#daa520' } },
];

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle?: string;
}

export default function AvatarSelector({ open, onOpenChange, currentStyle = 'cowboy' }: AvatarSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState(currentStyle);

  const updateAvatar = useMutation({
    mutationFn: async (style: string) => {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: style }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      return response.json();
    },
  });

  const handleSubmit = async () => {
    try {
      await updateAvatar.mutateAsync(selectedStyle);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update avatar:", error);
    }
  };

  const renderBirdPreview = (style: typeof BIRD_STYLES[0]) => {
    return (
      <div className="w-20 h-20 relative">
        {/* Bird body */}
        <div
          className="absolute w-16 h-12 rounded"
          style={{ backgroundColor: style.colors.body, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {/* Hat */}
          <div
            className="absolute w-12 h-4 rounded-sm -top-4 left-1"
            style={{ backgroundColor: style.colors.hat }}
          />
          {/* Bandana */}
          <div
            className="absolute w-16 h-3 rounded-sm"
            style={{ backgroundColor: style.colors.bandana, top: '25%' }}
          />
          {/* Eye */}
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
          onValueChange={setSelectedStyle}
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
          <Button onClick={handleSubmit} disabled={updateAvatar.isPending}>
            Save Choice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
