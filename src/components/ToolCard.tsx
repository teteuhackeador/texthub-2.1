import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
}

const ToolCard = ({ icon: Icon, title, description, path }: ToolCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] glass-card group"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-6 flex items-start gap-4">
        <div className="mt-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed transition-colors duration-300 group-hover:text-secondary-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;
