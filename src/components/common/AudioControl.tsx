import { AudioLines, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSound } from "@/lib/sound";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function AudioControl() {
  const { locale } = useI18n();
  const sound = useSound();
  const audible = sound.uiEnabled || sound.ambienceEnabled;
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={copy("Configurações de áudio", "Audio settings", "Configuración de audio")}
        >
          {audible ? <Volume2 /> : <VolumeX />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-xl border-border-strong bg-elevated p-4 shadow-lift">
        <div className="mb-4 flex items-center gap-2">
          <AudioLines className="size-4 text-gold-strong" />
          <h2 className="font-display text-sm font-semibold">
            {copy("Experiência sonora", "Sound experience", "Experiencia sonora")}
          </h2>
        </div>
        <div className="space-y-5">
          <AudioRow
            label={copy("Sons e interações", "Sounds and interactions", "Sonidos e interacciones")}
            checked={sound.uiEnabled}
            onCheckedChange={sound.setUiEnabled}
            value={sound.uiVolume}
            onValueChange={sound.setUiVolume}
          />
          <AudioRow
            label={copy("Ambiente dos hubs", "Hub ambience", "Ambiente de los hubs")}
            checked={sound.ambienceEnabled}
            onCheckedChange={sound.setAmbienceEnabled}
            value={sound.ambienceVolume}
            onValueChange={sound.setAmbienceVolume}
          />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {copy(
            "As preferências de áudio ficam salvas neste dispositivo.",
            "Audio preferences are saved on this device.",
            "Las preferencias de audio se guardan en este dispositivo.",
          )}
        </p>
      </PopoverContent>
    </Popover>
  );
}

function AudioRow({
  label,
  checked,
  onCheckedChange,
  value,
  onValueChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{label}</span>
        <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
      </div>
      <div className="grid grid-cols-[1fr_2.5rem] items-center gap-3">
        <Slider
          min={0}
          max={100}
          step={1}
          value={[value]}
          onValueChange={(values) => onValueChange(values[0] ?? 0)}
          disabled={!checked}
          aria-label={`${label} volume`}
        />
        <span className="text-right text-xs tabular-nums text-muted-foreground">{value}%</span>
      </div>
    </div>
  );
}
