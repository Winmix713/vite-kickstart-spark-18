import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyConfig } from "./propertyGroupsConfig";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface PropertyGroupProps {
  title: string;
  properties: PropertyConfig[];
  register: UseFormRegister<any>;
  errors: FieldErrors;
  values: Record<string, string | undefined>;
  onChange: (property: string, value: string) => void;
}

export const PropertyGroup = ({
  title,
  properties,
  register,
  errors,
  values,
  onChange,
}: PropertyGroupProps) => {
  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>}
      
      {properties.map((property) => (
        <div key={property.key} className="space-y-1.5">
          <Label htmlFor={property.key} className="text-xs">
            {property.label || property.key}
          </Label>
          
          {property.type === "select" ? (
            <Select
              value={values[property.key] || ""}
              onValueChange={(value) => onChange(property.key, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={property.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {property.options?.map((option) => (
                  <SelectItem key={option} value={option} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : property.type === "color" ? (
            <div className="flex gap-2">
              <Input
                type="color"
                {...register(property.key)}
                className="h-8 w-12 p-1"
                onChange={(e) => onChange(property.key, e.target.value)}
              />
              <Input
                type="text"
                value={values[property.key] || ""}
                onChange={(e) => onChange(property.key, e.target.value)}
                placeholder={property.placeholder}
                className="h-8 flex-1 text-xs"
              />
            </div>
          ) : property.type === "number" ? (
            <Input
              type="number"
              {...register(property.key)}
              min={property.min}
              max={property.max}
              step={property.step}
              onChange={(e) => onChange(property.key, e.target.value)}
              placeholder={property.placeholder}
              className="h-8 text-xs"
            />
          ) : (
            <Input
              type="text"
              {...register(property.key)}
              onChange={(e) => onChange(property.key, e.target.value)}
              placeholder={property.placeholder}
              className="h-8 text-xs"
            />
          )}
          
          {errors[property.key] && (
            <p className="text-xs text-destructive">
              {errors[property.key]?.message as string}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
