import React , {useEffect, useState} from 'react';
import './Timeline.css';
import axios from 'axios';

const Timeline = ( {claim_id , usertype} ) => {
  const [events , setEvents] = useState([]);

  useEffect(()=>{
    const fetchTimeline = async () => {
      try {
        const response = await axios.post(`http://192.168.1.32:5015/${usertype}/claim_timeline`, { claim_id });
        if (response.data.success) {
          setEvents(response.data.events);
        } else {
          console.error('Error:', response.data.error);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };
    if (claim_id) fetchTimeline();
  },[claim_id]);

    return (
    <div className="timeline">

      {events.map((event, index) => {
        const utcDate = new Date(event.timestamp).toUTCString();

        return (
          <div className="timeline-item" key={index}>
            <div className="timeline-dot"></div> 
            <div className="timeline-content">
              <p>{utcDate}</p>
              <p>{event.description}</p>
            </div>
            {index < events.length - 1 && <div className="timeline-connector"></div>}
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;