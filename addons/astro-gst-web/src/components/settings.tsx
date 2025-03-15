import { Switch } from "@/components/ui/switch";
import useAppStore from '@/lib/store/app';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SwitchAction {
	id: string;
	label: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	description?: string;
}

export function Settings() {
	const {
		resizeRemote,
		setResizeRemote,
		scaleLocal,
		setScaleLocal,
		debug,
		setDebug,
		turnSwitch,
		setTurnSwitch
	} = useAppStore();

	const windowActions: SwitchAction[] = [
		{
			id: "resize-fit",
			label: "Resize remote to fit window",
			checked: resizeRemote,
			onCheckedChange: setResizeRemote,
		},
		{
			id: "scale-fit",
			label: "Scale to fit window",
			checked: scaleLocal,
			onCheckedChange: setScaleLocal,
		},
	];

	const debugActions: SwitchAction[] = [
		{
			id: "debug-logs",
			label: "Debug logs",
			checked: debug,
			onCheckedChange: setDebug,
		},
		{
			id: "force-relay",
			label: "Force relay connection",
			checked: turnSwitch,
			onCheckedChange: setTurnSwitch,
		},
	];

	const SwitchItem = ({ action }: { action: SwitchAction }) => (
		<div className="flex items-center justify-between space-x-4">
			<label htmlFor={action.id} className="text-sm text-muted-foreground">
				{action.label}
				{action.description && (
					<p className="text-xs text-muted-foreground">{action.description}</p>
				)}
			</label>
			<Switch
				id={action.id}
				checked={action.checked}
				onCheckedChange={action.onCheckedChange}
				className="data-[state=unchecked]:bg-input"
			/>
		</div>
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent group">
					<ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
					<span className="text-left break-words whitespace-normal flex-1">Settings</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="left" align="start" className="w-[300px] p-4">
				<div className="space-y-3 px-3 py-2">
					{/* Window Actions */}
					{windowActions.map((action) => (
						<SwitchItem key={action.id} action={action} />
					))}

					{/* Debugging Section */}
					<div className="pt-2">
						<div className="text-sm font-medium mb-2">Debugging</div>
						<div className="space-y-3">
							{debugActions.map((action) => (
								<SwitchItem key={action.id} action={action} />
							))}
						</div>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
