import { useDetectGPU } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { DeviceClass } from "../utils/density";
import { ParticleSystem, type ParticleSystemProps } from "./ParticleSystem";

// Unknown tiers stay mobile-conservative.
function useDeviceClass(): DeviceClass {
  const gpu = useDetectGPU();
  return gpu && !gpu.isMobile && gpu.tier >= 2 ? "desktop" : "mobile";
}

export function ParticleScene(props: Omit<ParticleSystemProps, "deviceClass">) {
  const deviceClass = useDeviceClass();
  const { settings } = props;
  return (
    <>
      <ParticleSystem {...props} deviceClass={deviceClass} />
      {settings.bloomIntensity > 0 ? (
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={settings.bloomIntensity}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.3}
          />
        </EffectComposer>
      ) : null}
    </>
  );
}
