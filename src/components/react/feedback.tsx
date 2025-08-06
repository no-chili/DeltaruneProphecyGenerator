import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SITE_DOMAIN } from "@/var";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function FeedbackComponent() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("feature");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://feedback.chiliapp.site/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: SITE_DOMAIN,
            type: type,
            message: message.trim(),
          }),
        }
      );

      if (response.ok) {
        setMessage("");
        setType("feature");
        setIsOpen(false);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <div className="flex items-center justify-center cursor-pointer bg-primary w-12 h-12 rounded-full hover:scale-110 transition-all duration-300">
            <MessageCircle className="text-white" size={28} />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Feedback & Suggestions</AlertDialogTitle>
            <AlertDialogDescription>
              Please share your thoughts, suggestions, or report any issues
              you've encountered. We value your feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Feedback Type
              </label>
              <Select
                value={type}
                onValueChange={setType}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">I have a suggestion</SelectItem>
                  <SelectItem value="issue">I found a bug</SelectItem>
                  <SelectItem value="other">Other feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Feedback Content
              </label>
              <Textarea
                placeholder="Please enter your feedback..."
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setMessage(e.target.value)
                }
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
