/** @author aaron-iz */
import { Box, useMantineTheme } from "@mantine/core";

interface ChronosLogoProps {
    height?: number;
}

export function ChronosLogo({ height = 40 }: ChronosLogoProps) {
    const theme = useMantineTheme();
    const primaryColor = theme.colors[theme.primaryColor][6];
    const lightColor = theme.colors[theme.primaryColor][3];
    const darkColor = theme.colors[theme.primaryColor][8];

    // Calculate dimensions based on height
    const width = height * 3.5;
    const fontSize = height * 0.5;

    return (
        <Box
            component="svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ display: "block", overflow: "visible", direction: "ltr" }}
        >
            {/* Background circle elements for time/clock theme */}
            <circle
                cx={height / 2}
                cy={height / 2}
                r={height * 0.35}
                fill="none"
                stroke={lightColor}
                strokeWidth="1.5"
                opacity="0.4"
            />
            <circle
                cx={height / 2}
                cy={height / 2}
                r={height * 0.25}
                fill="none"
                stroke={primaryColor}
                strokeWidth="1"
                opacity="0.6"
            />

            {/* Clock hands - stylized */}
            <line
                x1={height / 2}
                y1={height / 2}
                x2={height / 2 + height * 0.15}
                y2={height / 2 - height * 0.1}
                stroke={darkColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
            />
            <line
                x1={height / 2}
                y1={height / 2}
                x2={height / 2 - height * 0.05}
                y2={height / 2 - height * 0.18}
                stroke={darkColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
            />

            {/* Center dot */}
            <circle
                cx={height / 2}
                cy={height / 2}
                r={height * 0.05}
                fill={primaryColor}
            />

            {/* "CHRONOS" text with modern styling */}
            <text
                x={height * 1.1}
                y={height / 2 + fontSize * 0.35}
                fontFamily="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
                fontSize={fontSize}
                fontWeight="700"
                letterSpacing="0.05em"
                fill={primaryColor}
                direction="ltr"
                unicodeBidi="isolate"
                textAnchor="start"
            >
                CHRONOS
            </text>

            {/* Decorative time dots below text */}
            <g opacity="0.5">
                <circle
                    cx={height * 1.1}
                    cy={height * 0.75}
                    r={height * 0.03}
                    fill={lightColor}
                />
                <circle
                    cx={height * 1.25}
                    cy={height * 0.75}
                    r={height * 0.03}
                    fill={primaryColor}
                />
                <circle
                    cx={height * 1.4}
                    cy={height * 0.75}
                    r={height * 0.03}
                    fill={lightColor}
                />
            </g>

            {/* Modern accent line */}
            <line
                x1={height * 1.1}
                y1={height * 0.2}
                x2={width - height * 0.3}
                y2={height * 0.2}
                stroke={primaryColor}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
            />
        </Box>
    );
}
