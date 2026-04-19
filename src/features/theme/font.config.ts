import {
  Architects_Daughter,
  DM_Sans,
  Fira_Code,
  Geist,
  Geist_Mono,
  Inter,
  JetBrains_Mono,
  Merriweather,
  Outfit,
  Playfair_Display,
  Space_Mono
} from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
const fontInter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fontOutfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const fontDMSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const fontSpaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono'
});
const fontFiraCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code'
});
const fontJetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
});
const fontMerriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather'
});
const fontPlayfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display'
});
const fontArchitectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-architects-daughter'
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInter.variable,
  fontOutfit.variable,
  fontDMSans.variable,
  fontSpaceMono.variable,
  fontFiraCode.variable,
  fontJetBrainsMono.variable,
  fontMerriweather.variable,
  fontPlayfairDisplay.variable,
  fontArchitectsDaughter.variable
);
