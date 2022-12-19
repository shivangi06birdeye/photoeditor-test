import { Component } from "react";
import { UIEvent, PhotoEditorSDKUI, ImageFormat, ExportFormat, LibraryCategory, LibraryProvider, LibraryImage } from "photoeditorsdk";
import imglyLicence from "./imglyLicense.json";


class ImageEditor extends Component {

    constructor() {
        super();

        this.state = {
            toolInfo: "text",
            downloadAd: null
        };
        this.editor = null;
    }

  
    data = "";

    

    componentDidMount() {
        this.initEditor();
    

    }
    
    updateCustomMetaData(currentState, customState) {

        let customSpriteArray ;
        let index;
        try {
            for (let i in customState.operations) {
                if ( customState.operations[i].type == "sprite") {
                    customSpriteArray = customState.operations[i].options.sprites;
                    index = i;
                    break;
                }
            }
            let currentSpriteArray = currentState.operations[0].options.sprites;
            let newSpriteArray = [];
            let startI = 0;
            newSpriteArray.push(customSpriteArray[0]);
            newSpriteArray.push(customSpriteArray[1]);
            for (let a in currentSpriteArray) {
                if (currentSpriteArray[a].type == "sticker" ) {
                    newSpriteArray.push(currentSpriteArray[a]);
                }
            }
            newSpriteArray[0].options.text = currentSpriteArray[0].options.text;
            newSpriteArray[1].options.text = currentSpriteArray[1].options.text;

            for (let s in newSpriteArray) {
                if (newSpriteArray[s].type == "sticker" && newSpriteArray[s].options.identifier == "source") {
                    newSpriteArray[s].options.position = customSpriteArray[2].options.position;
                } else if (newSpriteArray[s].type == "sticker" && newSpriteArray[s].options.identifier == "imgly_sticker_shapes_badge_12") {
                    newSpriteArray[s].options.position.x = customSpriteArray[3].options.position.x - (customSpriteArray[3].options.maxWidth / 2) + (0.05 * startI);
                    newSpriteArray[s].options.position.y = customSpriteArray[3].options.position.y;
                    startI++;
                }
            }
            customState.assetLibrary.assets.stickers[0].raster.data = currentState.assetLibrary.assets.stickers[0].raster.data;
            customState.operations[index].options.sprites = newSpriteArray;
            return customState;
        } catch (e) {
            console.log(e);
            return currentState;
        }
    }

    s3LinktoJson = async (url) => {
        return (fetch(url)
          .then(function (res) {
            return res.json();
          })
        );
      };
    getCustomMetaData(metadata) {
        const state = this.s3LinktoJson(metadata);
        state.then((value) => {
            let stateMeta = this.updateCustomMetaData(this.props.initialState,value);
            this.editor
                .deserialize(stateMeta)
                .then(() => {
                    console.log("value",value);
                    //console.log("Restored state!");
                })
                .catch(err => {
                    console.log("An error has occured ", err);
                });
        });
    }
    updateBackgroundImage(sourceUrl) {
        this.toDataURL(sourceUrl)
            .then(dataUrl => {
                const state = this.props.initialState;
                state.image.data = dataUrl.substring(dataUrl.indexOf(",") + 1);
                this.editor
                    .deserialize(state)
                    .then(() => {
                    //console.log("Restored state!");
                    })
                    .catch(err => {
                        console.log("An error has occured ", err);
                    });

            }).catch(e => {
                console.log("An error has occured ", e);
                this.editor
                    .deserialize(this.props.initialState)
                    .then(() => {
                    //console.log("Restored state!");
                    })
                    .catch(err => {
                        console.log("An error has occured ", err);
                    });
            });
    }

    toDataURL = url => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }))

    async initEditor() {
        const { canChangeContent } = this.props;
        this.editor = await PhotoEditorSDKUI.init({
            container: "#editor",
            license: JSON.stringify(imglyLicence),
            image: "https://d2xt3xymj142xp.cloudfront.net/161371810825470/socialtemplate/1668501717401.png", // Image url or Image path relative to assets folder
            theme: "light",
            defaultTool: "library",
            export: {
                image: {
                    enableDownload: false, // will prevent the file download on the user side
                    format: ImageFormat.PNG,
                    exportType: ExportFormat.DATA_URL
                }
            },
            library: {
                enableUpload: true,
                //    enableWebcam: true,
                provider: LibraryProvider
            },
            layout: "advanced", //advanced || basic
            mainCanvasActions: ["undo","redo"],
            // canvasActions: ["bringtofront", "flip", "duplicate", "delete"],
            assetBaseUrl: "https://cdn.jsdelivr.net/npm/photoeditorsdk@latest/assets",
            tools: this.props.hideLibraryTool && this.props.hideSticker ? [
                [ "transform", "text"]
            ] : this.props.hideSticker ? [
                ["library", "transform", "text"]
            ] : this.props.hideLibraryTool ? ["transform", "text","sticker"] : ["library","transform", "text","sticker"] ,
            custom: {
                measurements: {
                    fontSystem: {
                        headline1: {
                            size: 16,
                            letterSpacing: 1.5,
                            case: "none"
                        },
                        button1: {
                            size: 12, letterSpacing: 1.2, case: "none"
                        },
                        button2: {
                            size: 14, letterSpacing: 0, case: "none"
                        }

                    }
                },
                languages: {
                    en: {
                        common: {
                            error: "Error",
                            warning: "Unsaved changes"
                        },
                        warningModals: {
                            discardChanges: {
                                headingDelimiter: "",
                                body:
                                    "You have unsaved changes. Are you sure you want to discard the changes?",
                                buttonYes: "Discard changes",
                                buttonNo: "Keep changes"
                            }
                        },
                        library: {
                            title: "Templates"
                        },
                        transform: {
                            title: "Layout"
                        },
                        text: {
                            canvasActions: {
                                buttonBringToFront: "Move to top",
                                buttonDuplicate: "Duplicate"
                            },

                            canvasControls: {
                                placeholderText: "Write Something",
                                buttonSave: "Save",
                                buttonClose: "Cancel",
                                inputText: "Edit text"
                            }

                        },
                        sticker: {
                            title: "Stickers",
                            controls: {
                                buttonUpload: "Upload Sticker",
                                sliderOpacity: "Sticker Opacity",
                                selectColor: "Sticker Color"
                            }
                        }
                    }
                },
                components: {
                }
                // , text: {
                //     canvasControls: true
                // }
            },
            text: {
                advancedUIToolControlBarOrder: canChangeContent ? [
                    "separator",
                    "newTextButton",
                    "fontFamilyDropdown",
                    "fontSizeInput",
                    "textAlignmentList",
                    "separator",
                    "textColorList",
                    "separator",
                    "lineSpacingSlider"
                ] : [
                    "separator",
                    "fontFamilyDropdown",
                    "fontSizeInput",
                    "textAlignmentList",
                    "separator",
                    "textColorList",
                    "separator",
                    "lineSpacingSlider"
                ],
                canvasActions: canChangeContent ? ["edit", "duplicate", "delete"] : [],
                maxCharacterLimit: 1000
                // canvasControls: false
            },
            sticker: {
                categories: [
                    {
                        identifier: "imgly_sticker_emoticons",
                        items: [
                            { identifier: "imgly_sticker_shapes_badge_01" },
                            { identifier: "imgly_sticker_shapes_badge_04" },
                            { identifier: "imgly_sticker_shapes_badge_12" },
                            { identifier: "imgly_sticker_shapes_badge_36" },
                            { identifier: "imgly_sticker_shapes_badge_35" },
                            { identifier: "imgly_sticker_shapes_badge_20" }
                        ]
                    }
                ],
                advancedUIToolControlBarOrder: canChangeContent ? [
                    "separator",
                    "uploadStickerButton",
                    "stickerColorList",
                    "separator",
                    "items"
                ] : [ "separator",
                    "stickerColorList",
                    "separator"
                ],
                canvasActions: canChangeContent ? ["flip", "duplicate", "delete"] : [] ,
                flattenCategories: true
            },
            transform: {
            }
        });

        this.editor.on(UIEvent.EDITOR_READY, async () => {
            console.log("editor ready")
                    this.getCustomMetaData("https://bzimages-demo.s3.amazonaws.com/151134205012586/socialtemplate/1671177800915.json");
               
           

        });

        this.editor.on(UIEvent.EXPORT, (image) => {
           

            // if (this.props.imageEditorWithSocial) {
            //     this.props.changeFlagValue();
            //     this.props.updateBase64(image);
            // }

        });
        this.editor.on(UIEvent.IMAGE_LOAD, () => {
          
            // this.editor
            //     .serialize({ image: true }) // Default { image: false }
            //     .then(state => {
            //         if (this.props.imageEditorWithSocial) {

            //         this.props.updateInitialState(state);}
            //         console.log("Editor state:", state);
            //     })
            //     .catch(err => {
            //         console.log("An error has occured ", err);
            //     });
        });

        this.editor.on(UIEvent.TOOL_ENTER, (tool) => {
            this.setState({ toolInfo: tool });

        });
    }

    // moveToSocialScreen = () => {
    //     this.editor.export();
    // }

    clickOnNextBtn = () => {
        if (this.props.loading)
            return;
        this.editor.export();
    }

    //   moveToSocialScreen = () => {
    //       this.editor.export();
    //   }

    downloadAd = () => {
        this.setState({ downloadAd: true });
        this.editor.export();
    }

    render() {
        console.log("editor ready")
        return (

            <div >
                <div
                    id="editor" ref={elem => this.nv = elem} className="image-editor-wrapper"
                />
            </div>
        );
    }
}


export default ImageEditor;

