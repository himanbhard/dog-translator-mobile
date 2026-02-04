import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, CameraProps } from 'react-native-vision-camera';

interface CameraViewProps extends Partial<CameraProps> {
    device: any;
}

export const CameraView = forwardRef<Camera, CameraViewProps>(({ device, ...props }, ref) => {
    return (
        <Camera
            ref={ref}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
            {...props}
        />
    );
});

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
});
