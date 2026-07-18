declare module "firebase/app" {
  export function initializeApp(config: any, name?: string): any;
  export function getApps(): any[];
}

declare module "firebase/auth" {
  export function getAuth(app?: any): any;
  export function signInWithPhoneNumber(auth: any, phone: string, appVerifier: any): Promise<any>;
  export class RecaptchaVerifier {
    constructor(auth: any, container: string | HTMLElement, params: any);
    render(): Promise<number>;
    clear(): void;
  }
}

declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  export const Apple: FC<SVGProps<SVGSVGElement>>;
  export const Coffee: FC<SVGProps<SVGSVGElement>>;
  export const Shirt: FC<SVGProps<SVGSVGElement>>;
  export const Home: FC<SVGProps<SVGSVGElement>>;
  export const ShoppingBag: FC<SVGProps<SVGSVGElement>>;
  export const Truck: FC<SVGProps<SVGSVGElement>>;
  export const Shield: FC<SVGProps<SVGSVGElement>>;
  export const Package: FC<SVGProps<SVGSVGElement>>;
  export const MapPin: FC<SVGProps<SVGSVGElement>>;
  export const Plus: FC<SVGProps<SVGSVGElement>>;
  export const Search: FC<SVGProps<SVGSVGElement>>;
  export const Building: FC<SVGProps<SVGSVGElement>>;
}
