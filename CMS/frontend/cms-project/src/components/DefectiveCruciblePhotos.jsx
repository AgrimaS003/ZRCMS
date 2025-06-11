import React from 'react';
import { FaRegImage, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function DefectiveCruciblePhotos({ defectivePhotos, isProcessed, isApproved }) {
    // console.log("Claim View Data:", defectivePhotos);
    const photos = [
        { name: "POINT THE PROBLEM.jpg", status: "Uploaded", remarks: "NA", url: "/images/point-the-problem.jpg" },
        { name: "FULL VIEW OF PROBLEMATIC CRUCIBLE.jpg", status: "Uploaded", remarks: "NA", url: "/images/full-view.jpg" },
        { name: "CRUCIBLE WITH REFERENCE OF LOCATION.jpg", status: "Uploaded", remarks: "NA", url: "/images/reference-location.jpg" },
        { name: "TOP VIEW.jpg", status: "Uploaded", remarks: "NA", url: "/images/top-view.jpg" },
        { name: "BOTTOM VIEW.jpg", status: "Uploaded", remarks: "NA", url: "/images/bottom-view.jpg" }
    ];
    // console.log(defectivePhotos?.s_photo_id
    //     , defectivePhotos?.s_photo_name
    //     , defectivePhotos?.s_photo_status)
    // defectivePhotos.forEach(photo => {
    //     console.log(photo.s_photo_id, photo.s_photo_name, photo.s_photo_status);
    // }
    // );
    const openImageInNewTab = (base64, name) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);

        const newTab = window.open(blobUrl, '_blank');
        if (newTab) {
            newTab.focus();
        } else {
            alert("Popup blocked. Please allow popups for this site.");
        }
    };


    function changemode(id, status) {
        // Always send the new status in the URL!
        if (status === "0" || status === "1") {
            fetch(`http://192.168.1.29:5015/putdefectivephoto/2/${id}`, {
                method: "PUT"
            })
        }
    }
    function changecancel(id, status) {
        if (window.confirm("Are you sure you want to reject this photo?")) {
            if (status === "0" || status === "1" || status === "2") {
                fetch(`http://192.168.1.29:5015/putdefectivephoto/3/${id}`, {
                    method: "PUT"
                })
            }
        }
    }

    return (
        <div className="defective-photos-section">
            <h2>Defective Crucible Photos</h2>
            <div className="defective-photos-grid">
                {defectivePhotos.map((photo, idx) => (
                    <div className="defective-photo-card" key={idx}>
                        <div className="defective-photo-info">
                            <div className="defective-photo-title">{photo.s_photo_name}</div>
                            <div className="defective-photo-status">
                                <span>Status:</span> {(photo.s_photo_status === "0" && "Uploaded") || (photo.s_photo_status === "1" && "Reuploaded") || (photo.s_photo_status === "2" && "Accepted By Manager") || (photo.s_photo_status === "3" && "Rejected By Manager")}
                            </div>
                            <div className="defective-photo-remarks">
                                <span>Remarks:</span> {photo.ns_remarks}
                            </div>
                        </div>
                        <div className="defective-photo-actions">
                            <button
                                className="defective-photo-icon"
                                title="View Image"
                                onClick={() => openImageInNewTab(photo.s_photo, photo.s_photo_name)}
                            >
                                <FaRegImage />
                            </button>
                            <button className={`photo-action-btn green ${(isProcessed === false || isApproved == false) ? "display-none" : ""}`} title="Approve" onClick={() => changemode(photo.s_photo_id, photo.s_photo_status)}>
                                <FaCheck />
                            </button>
                            <button className={`photo-action-btn red ${(isProcessed === false || isApproved == false) ? "display-none" : ""}`} title="Reject" onClick={() => changecancel(photo.s_photo_id, photo.s_photo_status)}>
                                <FaTimes />
                            </button>
                        </div>
                        {/* <img src={} alt={photo.s_photo_name} /> */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DefectiveCruciblePhotos;