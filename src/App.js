import { Component, Fragment } from "react";
import ImageEditor from "./imageEditor";
import axios from "axios";
import initialEditorMetaData from './initialMetaData.json';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            initialState: null,
            loading: true,
            headerText: "Share on Social",
            flag: false,
            contentLoading: true,
            blob: "",
            data: "",
            showDatePicker: false,
            utcDate: null,
            sourceBase64: null,
            isEditorView: true,
            scheduleBtnStatusDisabled: true,
            loadingMetaState: false,
            isCustomImageUploaded: false,
            showEditorModal: false
        };
    }

    async componentDidMount() {
            let sourceUrl =  `https://d2bcw1l732sg21.cloudfront.net/public-334/images/copied-images/source/icons/z-dummy.png` 
            //: `https://d2bcw1l732sg21.cloudfront.net/public-338/images/copied-images/source/icons/${sourceType[0].toLowerCase()}-dummy.png`;
            try {
                let reviewSourceIconResp = await axios.get(sourceUrl);
                if (reviewSourceIconResp) {
                    this.toDataURL(sourceUrl)
                        .then(dataUrl => {
                            this.setState({ sourceBase64: dataUrl },() => {
                                return {
                                    initialState: this.updateState()
                                };
                            });
                        });
                }
            } catch (e) {
                this.toDataURL(`https://d2bcw1l732sg21.cloudfront.net/public-338/images/copied-images/source/icons/a-dummy.png`)
                    .then(dataUrl => {
                        this.setState({ sourceBase64: dataUrl },() => {

                            return {
                                initialState: this.updateState()
                            };
                        });
                    });
            }
     
    }

 
  

    toDataURL = url => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }))

    updateState = () => {
        let customSpriteArray = initialEditorMetaData.operations[0].options.sprites;
        console.log("update state", 1)

        let reviewText = "sdsdsdsdsd"
        customSpriteArray[0].options.text =  reviewText;
        customSpriteArray[1].options.text = "shiavngi " + " via " + "google" + " on " + "20/20/2000";
        console.log("update state", 2)
       
        initialEditorMetaData.operations[0].options.sprites = customSpriteArray;
        let sourceBase = this.state.sourceBase64;
        console.log("update state", 3)
        initialEditorMetaData.assetLibrary.assets.stickers[0].raster.data = sourceBase.substring(sourceBase.indexOf(",") + 1);
        this.setState({ initialState: initialEditorMetaData }, () => {
            console.log("hello")
            this.setState({
                showEditorModal: true
            });
        });
        return initialEditorMetaData;
    }

   
 

   


    getUploadStepCta = () => {
        return {
            next: {
                onClick: this.onUploadClickNext
            }
        };
    };

    onUploadClickNext = (payload) => {
        this.setState({ clickNext: true });
        const { callback } = payload || {};
        setTimeout(() => {
            callback && callback();
            this.setState({ isEditorView: false });
        }, 2000);
    };

  
   


    updateInitialState = (state) => {
        this.setState({ initialState: state });
    }

  

    

    updateClickNext = () => {
        this.setState({ clickNext: false });
    }

    updateBase64 = (dataData) => {
        this.setState({ data: dataData });
        const a = this.dataURLtoFile(dataData, "abc.png");
        const blobData = URL.createObjectURL(a);
        this.setState({ blob: blobData });
    }

  

    dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

 
    // schedule post changes end

    render() {
        console.log("editor ready", this.state.showEditorModal)
        return (
            <div>

<div>
               
               {this.state.showEditorModal && (
                   <ImageEditor 
                       initialState={this.state.initialState} 
                       
                       
                   />
               )}
           </div>
            </div>
        );
    }

}


export default App;

