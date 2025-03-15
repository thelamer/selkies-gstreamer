import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useAppStore from '@/lib/store/app';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function Logs() {
	const { logEntries, debugEntries } = useAppStore();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent group">
					<ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
					<span className="text-left break-words whitespace-normal flex-1">Logs</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="left" align="start" className="w-[400px] p-4">
				<Tabs defaultValue="status" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="status">Status Logs</TabsTrigger>
						<TabsTrigger value="debug">Debug Logs</TabsTrigger>
					</TabsList>
					<TabsContent value="status">
						<Textarea
							className="h-[300px] resize-none font-mono"
							placeholder="Status logs will appear here..."
							readOnly
							value={logEntries.join('\n\n')}
						/>
					</TabsContent>
					<TabsContent value="debug">
						<Textarea
							className="h-[300px] resize-none font-mono"
							placeholder="Debug logs will appear here..."
							readOnly
							value={debugEntries.join('\n\n')}
						/>
					</TabsContent>
				</Tabs>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
