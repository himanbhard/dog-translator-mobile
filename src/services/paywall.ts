import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
    apple: 'appl_placeholder_key',
    google: 'goog_placeholder_key',
};

class PaywallService {
    isInitialised = false;

    async init() {
        if (this.isInitialised) return;

        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: API_KEYS.apple });
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: API_KEYS.google });
        }

        this.isInitialised = true;
    }

    async getOfferings(): Promise<PurchasesPackage[]> {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current && offerings.current.availablePackages.length !== 0) {
                return offerings.current.availablePackages;
            }
        } catch (e) {
            console.warn("Error fetching offerings", e);
        }
        return [];
    }

    async purchasePackage(pack: PurchasesPackage): Promise<boolean> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            if (customerInfo.entitlements.active['pro']) {
                return true;
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase error", e);
            }
        }
        return false;
    }

    async restorePurchases(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.restorePurchases();
            return !!customerInfo.entitlements.active['pro'];
        } catch (e) {
            console.error("Restore error", e);
            return false;
        }
    }
}

export const Paywall = new PaywallService();
