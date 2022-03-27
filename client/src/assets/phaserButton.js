
export default class phaserButton
{
    constructor(container,text,onPress,scene)
    {
        // A button has text and a container
        this.text = text;
        this.container = container;
        // The container is made interactive and given listeners
        this.container.setInteractive();
        this.container.on('pointerup', onPress,{scene:scene,container:container,text:text});
        this.container.on('pointerdown', () => {
            this.container.setFillStyle(0xb0b0b0);
        });
    }

    hide()
    {
        // On hide the container and text are made invisible and the container is made no longer interactive
        this.container.setVisible(false);
        this.text.setVisible(false);
        this.container.disableInteractive();
    }
    
    show()
    {
        // On show the container and text are made visible and the container is made interactive
        this.container.setVisible(true);
        this.text.setVisible(true);
        this.container.setInteractive();
    }
}