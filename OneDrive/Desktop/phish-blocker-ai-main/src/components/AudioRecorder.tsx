import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Play, Pause, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, audioBase64: string) => void;
  onClear: () => void;
}

export default function AudioRecorder({ onAudioRecorded, onClear }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onAudioRecorded(audioBlob, base64String.split(',')[1]);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/ogg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|m4a|ogg)$/i)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file (MP3, WAV, WEBM, M4A, OGG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Audio file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      setFileName(file.name);

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onAudioRecorded(file, base64String.split(',')[1]);
      };
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process audio file",
        variant: "destructive",
      });
    }
  };

  const clearRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingTime(0);
    setFileName(null);
    audioChunksRef.current = [];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioURL) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {!audioURL ? (
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-lg">
          {isRecording ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="text-lg font-medium">{formatTime(recordingTime)}</span>
              </div>
              <Button
                type="button"
                onClick={stopRecording}
                variant="destructive"
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Record audio or upload an existing file
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={startRecording}
                  className="gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Record Audio
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.webm,.m4a,.ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={togglePlayback}
                variant="outline"
                size="icon"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <span className="text-sm font-medium">
                {fileName || `Recording (${formatTime(recordingTime)})`}
              </span>
            </div>
            <Button
              type="button"
              onClick={clearRecording}
              variant="ghost"
              size="icon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {audioURL && (
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      )}
    </div>
  );
}
