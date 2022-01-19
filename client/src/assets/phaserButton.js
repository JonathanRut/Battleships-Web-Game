
export default class phaserButton
{
    constructor(container,text,onPress,scene)
    {
        this.text = text;
        this.container = container;
        this.container.setInteractive();
        this.container.on('pointerup', onPress,{scene:scene,container:container,text:text});
        this.container.on('pointerdown', () => {
            this.container.setFillStyle(0xb0b0b0);
        });
    }

    hide()
    {
        this.container.setVisible(false);
        this.text.setVisible(false);
        this.container.disableInteractive();
    }
    
    show()
    {
        this.container.setVisible(true);
        this.text.setVisible(true);
        this.container.setInteractive();
    }
}