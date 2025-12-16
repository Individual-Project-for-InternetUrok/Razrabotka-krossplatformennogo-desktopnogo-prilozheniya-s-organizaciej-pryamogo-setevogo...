import { useEffect } from "react";
import { toast } from "sonner";

export default function ErrorHandler() {
    useEffect(() => {
        function handleError(message: unknown) {
            toast.error(message as string);
        }

        window.api.on("error", handleError);

        return () => {
            window.api.removeListener("error", handleError);
        };
    }, []);

    return null;
}
