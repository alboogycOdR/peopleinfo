import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function SubmissionForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    address: "",
    cellNumber: "",
    employed: false,
    hasBusiness: false,
    skills: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.person.submit.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitMutation.mutateAsync(formData);
      setSubmitted(true);
      setFormData({
        name: "",
        surname: "",
        address: "",
        cellNumber: "",
        employed: false,
        hasBusiness: false,
        skills: "",
      });
      toast.success("Person information submitted successfully!");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      toast.error("Failed to submit form. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Decorative technical elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/10 opacity-50" />
      <div className="absolute bottom-20 right-10 w-40 h-40 border-2 border-white/10 opacity-50" />
      <div className="absolute top-1/2 left-1/4 w-1 h-20 bg-white/20" />
      <div className="absolute bottom-1/3 right-1/4 w-20 h-1 bg-white/20" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-950/80 border-white/20 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-white" />
              <div>
                <CardTitle className="text-white text-2xl font-bold tracking-tight">
                  PERSON INFORMATION PORTAL
                </CardTitle>
                <CardDescription className="text-white/60 text-sm mt-1">
                  Submit your professional profile data
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Submission Successful</h3>
                <p className="text-white/70 mb-6">
                  Your information has been recorded in our system.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  Submit Another Record
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Surname Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-semibold text-sm">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname" className="text-white font-semibold text-sm">
                      Surname *
                    </Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white font-semibold text-sm">
                    Address *
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 resize-none h-20"
                  />
                </div>

                {/* Cell Number */}
                <div className="space-y-2">
                  <Label htmlFor="cellNumber" className="text-white font-semibold text-sm">
                    Cell Number *
                  </Label>
                  <Input
                    id="cellNumber"
                    name="cellNumber"
                    type="tel"
                    value={formData.cellNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your cell number"
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40"
                  />
                </div>

                {/* Employment and Business Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="employed"
                      name="employed"
                      checked={formData.employed}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 rounded border-white/30 bg-white/10 cursor-pointer"
                    />
                    <Label htmlFor="employed" className="text-white font-semibold text-sm cursor-pointer">
                      Currently Employed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hasBusiness"
                      name="hasBusiness"
                      checked={formData.hasBusiness}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 rounded border-white/30 bg-white/10 cursor-pointer"
                    />
                    <Label htmlFor="hasBusiness" className="text-white font-semibold text-sm cursor-pointer">
                      Have a Business
                    </Label>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-white font-semibold text-sm">
                    Type of Skills *
                  </Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Describe your professional skills (e.g., Programming, Design, Management)"
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 resize-none h-24"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="flex-1 bg-white text-blue-950 hover:bg-white/90 font-bold py-2"
                  >
                    {submitMutation.isPending ? "Submitting..." : "SUBMIT RECORD"}
                  </Button>
                  <Link href="/admin">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-white/30 text-white hover:bg-white/10"
                    >
                      Admin Portal
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
