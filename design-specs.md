# Mobile UI Design Specifications - Baccarat Game

## 1. Design Overview
This document outlines the visual and interaction specifications for the Baccarat Mobile Web Application. The design follows a "Dark Blue Casino" theme, emphasizing clarity, trust, and ease of use on mobile devices.

## 2. Color Palette

### Primary Colors
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `primary-bg` | `#0f172a` (Slate 900) | Main App Background, Bottom Nav |
| `secondary-bg` | `#1e293b` (Slate 800) | Secondary panels, modal backgrounds |
| `panel-bg` | `#172554` (Blue 950) | Betting Table Surface (Radial Gradient base) |

### Accent Colors (Game Logic)
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `player-color` | `#3b82f6` (Blue 500) | Player (闲) Text & Highlights |
| `player-dark` | `#1d4ed8` (Blue 700) | Player Button Background |
| `banker-color` | `#ef4444` (Red 500) | Banker (庄) Text & Highlights |
| `banker-dark` | `#b91c1c` (Red 700) | Banker Button Background |
| `tie-color` | `#22c55e` (Green 500) | Tie (和) Text & Highlights |
| `tie-dark` | `#15803d` (Green 700) | Tie Button Background |
| `gold` | `#fbbf24` (Amber 400) | Focus states, Winning Amounts, Chips |

### Neutral Colors
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `text-primary` | `#f1f5f9` (Slate 100) | Headings, Primary Values |
| `text-secondary` | `#94a3b8` (Slate 400) | Labels, Secondary Information |
| `divider` | `rgba(255,255,255,0.1)` | Borders, Separators |

## 3. Typography
**Font Family**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Roboto", sans-serif`

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| **Heading 1** | 20px | 600 | Page Titles |
| **Bet Title** | 32px | 800 | Main Bet Button Text (庄/闲) |
| **Bet Sub** | 12px | 500 | Odds Display |
| **Body** | 14px | 400 | General Text |
| **Caption** | 10px | 400 | Nav Labels, Info Labels |

## 4. Layout & Spacing
*   **Grid System**: 4px baseline grid. All spacing is a multiple of 4px (8px, 16px, 20px).
*   **Touch Targets**: Minimum 44x44px for all interactive elements.
*   **Safe Areas**: Padding for iOS Home Indicator and Notch.

### Structure
1.  **Header**: 44px height, sticky or fixed.
2.  **Video Area**: 200px height (16:9 aspect ratio optimized).
3.  **Betting Panel**: Flexible height, min 140px.
4.  **Bottom Nav**: 60px height + Safe Area Bottom.

## 5. Components

### Buttons
*   **Primary Action**: Gold gradient, 48px height, rounded corners (24px radius).
*   **Betting Buttons**: Large block styling, specific color coding (Blue/Red/Green), active state scale (0.96).

### Chips
*   **Size**: 56x56px circular.
*   **Selection**: Translate Y -10px, Drop Shadow increase.

### Roadmaps
*   **Bead Plate (Zhuzailu)**: Grid layout, solid colored circles with text.
*   **Big Road (Dalu)**: Hollow circles, dynamic grid rendering.

## 6. Interaction
*   **Transitions**: 200-300ms ease-out for all state changes.
*   **Feedback**: 
    *   Active state on tap (scale down).
    *   Toast messages for errors/confirmations (Pop-in animation).
    *   Winning visual cues (Gold text highlight).

