import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import useAppStore from '@/lib/store/app';

interface RadialGaugeProps {
	metric: {
		name: string;
		current: number;
		max: number;
		fill: string;
	};
	size: number;
}

function RadialGauge({ metric, size }: RadialGaugeProps) {
	const percentage = (metric.current / metric.max) * 100;
	const scaleFactor = size / 100;

	return (
		<div
			className="flex flex-col items-center"
			style={{
				width: size * 0.6,
				height: size * 0.7,
				minHeight: "60px",
			}}
		>
			<div style={{ width: size * 0.8, height: size * 0.7 }}>
				<RadialBarChart
					width={size * 0.8}
					height={size * 0.7}
					cx={(size * 0.8) / 2}
					cy={(size * 0.7) / 2}
					innerRadius={20 * scaleFactor}
					outerRadius={30 * scaleFactor}
					barSize={4 * scaleFactor}
					data={[{ ...metric, percentage }]}
					startAngle={180}
					endAngle={0}
				>
					<PolarAngleAxis
						type="number"
						domain={[0, 100]}
						angleAxisId={0}
						tick={false}
					/>
					<RadialBar
						background
						dataKey="percentage"
						cornerRadius={5 * scaleFactor}
						fill={metric.fill}
						className="stroke-transparent stroke-2"
					/>
					<text
						x={(size * 0.8) / 2}
						y={(size * 0.7) / 2}
						textAnchor="middle"
						dominantBaseline="middle"
						className="fill-foreground font-bold"
						style={{ fontSize: `${0.9 * scaleFactor}rem` }}
					>
						{metric.current}
					</text>
					<text
						x={(size * 0.8) / 2}
						y={(size * 0.7) / 2 + 18 * scaleFactor}
						textAnchor="middle"
						dominantBaseline="middle"
						className="fill-muted-foreground font-medium"
						style={{ fontSize: `${0.65 * scaleFactor}rem` }}
					>
						{metric.name}
					</text>
				</RadialBarChart>
			</div>
		</div>
	);
}

interface SystemMonitoringProps {
	scale?: number;
}

export function SystemMonitoring({ scale = 1 }: SystemMonitoringProps) {
	const { 
		gpuStat, 
		cpuStat, 
		connectionStat,
		videoBitRate,
		encoderName 
	} = useAppStore();

	const metrics = [
		{
			name: "Video",
			current: connectionStat.connectionVideoBitrate,
			max: videoBitRate / 1000,
			fill: "hsl(210, 100%, 50%)"
		},
		{
			name: "FPS",
			current: connectionStat.connectionFrameRate,
			max: 60,
			fill: "hsl(220, 100%, 60%)"
		},
		{
			name: "Latency",
			current: connectionStat.connectionLatency,
			max: 1000,
			fill: "hsl(230, 100%, 70%)"
		},
		// Conditional metrics based on encoder type
		...(encoderName.startsWith('hardware') ? [
			{
				name: "GPU",
				current: gpuStat.gpuLoad,
				max: 100,
				fill: "hsl(260, 100%, 60%)"
			},
			{
				name: "GPU Mem",
				current: (gpuStat.gpuMemoryUsed / gpuStat.gpuMemoryTotal) * 100,
				max: 100,
				fill: "hsl(240, 100%, 80%)"
			}
		] : [
			{
				name: "CPU",
				current: cpuStat.serverCPUUsage,
				max: 100,
				fill: "hsl(250, 100%, 70%)"
			},
			{
				name: "RAM",
				current: (cpuStat.serverMemoryUsed / cpuStat.serverMemoryTotal) * 100,
				max: 100,
				fill: "hsl(240, 100%, 80%)"
			}
		])
	];
	const baseSize = 85;
	const scaledSize = baseSize * scale;

	return (
		<Card className="w-full bg-background/80 backdrop-blur-sm">
			<CardHeader className="py-0.5 px-1">
				<div className="flex justify-between items-center">
					<div></div>
					<div className="flex items-center gap-2" style={{ fontSize: `${0.8 * scale}rem` }}></div>
				</div>
			</CardHeader>
			<CardContent className="py-0.5 px-1">
				<div className="flex flex-wrap justify-start gap-0">
					{metrics.map((metric) => (
						<RadialGauge
							key={metric.name}
							metric={metric}
							size={scaledSize * 0.65}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default SystemMonitoring;
