import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisResultsProps {
  analysis: {
    condition: string;
    severity: string;
    recommendations: string[];
    disclaimer: string;
  };
  className?: string;
}

/**
 * Component to display foot image analysis results in a structured card format
 */
export default function AnalysisResults({ analysis, className }: AnalysisResultsProps) {
  // Determine severity badge color
  const severityColor = () => {
    switch (analysis.severity.toLowerCase()) {
      case 'mild':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'severe':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Card className={cn("w-full bg-white shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Preliminary Assessment</CardTitle>
        <CardDescription>Based on the image you've provided</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Potential Condition</h4>
          <p className="text-primary font-medium">{analysis.condition}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Apparent Severity</h4>
          <Badge className={severityColor()}>
            {analysis.severity === 'unknown' ? 'Undetermined' : analysis.severity}
          </Badge>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Recommendations</h4>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="pt-1 text-xs text-gray-500 italic">
        {analysis.disclaimer}
      </CardFooter>
    </Card>
  );
}