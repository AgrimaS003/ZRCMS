import React from 'react'
// import Header from './Header'
import './Contact.css'
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa'
import emailjs from 'emailjs-com'

const Contact = () => {
    const handleSubmit = (e) =>{
        e.preventDefault()
        const form = e.target;
        const messageDiv= form.querySelector('.contact-message-for-user')

            const userEmail = form.user_email.value;
            const userName = form.user_name.value;
            const subject = form.subject.value;
            const message = form.message.value;
        
            //company
        emailjs.send(
                'service_CMS',
                'template_1p8qwlh',
                {
                    from_name: userName,
                    from_email: userEmail,
                    subject: subject,
                    message: message,
                    to_email: 'darshitjajadiya7@gmail.com', 
                },
                'xkbGSS5EzwJt7DBMu'
                )
                .then((res) => {
                console.log('Company Email Sent', res.text)
                })
                .catch((err) => {
                console.error('Company Email Error:', err.text)
                })

        emailjs.sendForm(
                'service_CMS',
                'template_m4uto8c', // Template that goes to user
                form,
                'xkbGSS5EzwJt7DBMu'
                )
                .then((res) => {
                console.log('User Email Sent', res.text)
                messageDiv.textContent = 'Message sent successfully!'
                messageDiv.style.color = 'blue'
                form.reset()
                })
                .catch((err) => {
                console.error('User Email Error:', err.text)
                messageDiv.textContent = 'Failed to Send Message'
                messageDiv.style.color = 'red'
                form.reset()
                }
            )
        }

  return (
    <div>
      {/* <Header /> */}
      <main className="contact-main">

        <div className="contact-head">
              <h2>Contact</h2>
              <p>Home / Contact</p>
        </div>

        <div className="contact-container">
          
          <div className="contact-info">
            <div className="contact-row">
              <div className="contact-card">
                <FaMapMarkerAlt className="contact-icon" />
                <p>Address</p>
                <p>402, Campus Corner Nr.St.Xaviers' College Cross Road,<br />
                  Navrangpura, Ahmedabad - 380009(Gujarat), INDIA.</p>
              </div>
              <div className="contact-card">
                <FaMapMarkerAlt className="contact-icon" />
                <p>Address</p>
                <p>Mehsana-Vijapur Road, Nr. Shobhasan Char Rasta Shobhasan,<br />
                  Mehsana - 384 001 (Gujarat), INDIA.</p>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-card">
                <FaPhoneAlt className="contact-icon" />
                <p>Call Us</p>
                <p>+91-79264 00538</p>
                <p>+91-82380 39054</p>
              </div>
              <div className="contact-card">
                <FaClock className="contact-icon" />
                <p>Open Hours</p>
                <p>Monday - Friday</p>
                <p>10:00 AM - 06:00 PM</p>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <div className="contact-form-card">
              <form id='contact-inquiry-form' onSubmit={handleSubmit}>
                <input type="text" name='user_name' placeholder='Your Name' required />
                <input type="email" name="user_email" placeholder='Your Email' required />
                <input type="text" name="subject" placeholder='Subject' />
                <textarea name='message' rows={5} placeholder='Message' required></textarea>
                <input type="submit" value="Send Message" required />
                <div className='contact-message-for-user'></div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <p style={{ color: '#012970', textAlign: 'center' }}><b>@Zircar Refactories.</b> All Rights Reserved</p>
    </div>
  )
}

export default Contact