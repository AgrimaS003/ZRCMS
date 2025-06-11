import React, { useState } from 'react';

const InstructionCard = () => {
  const [visibleIndex, setVisibleIndex] = useState(null);

  const toggleContent = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  const sections = [
    {
      title: "Read more",
      content: [
        "1. Name and address of Customer should be mentioned as per bill of dealer / Branch.",
        "2. Inv. No & Date of ZCPL is the invoice number and date against which the complaint crucible was supplied.",
        "3. Dealer / Branch invoice number and date for the complaint crucible should be mentioned.",
        "4. Installation and failure date of crucible should be mentioned as per customer records."
      ]
    },
    {
      title: "Provident beatae eveniet placeat est aperiam repellat adipisci?",
      content: [
        "In minus quia impedit est quas deserunt. Nulla non quo dolores minima. Qui nesciunt odio officia beatae iusto sed. Officia vitae sit voluptatem nostrum."
      ]
    },
    {
      title: "Minus aliquam modi id reprehenderit nihil?",
      content: [
        "Voluptates magni amet enim perspiciatis. Sit beatae animi incidunt eum repellat. Id et vel et et. Nesciunt corrupti quia ducimus."
      ]
    },
    {
      title: "Quaerat qui est iusto asperiores qui est reiciendis eos et?",
      content: [
        "Numquam ut reiciendis aliquid. Quia veritatis quasi ipsam sed quo ut eligendi et non. Doloremque sed voluptatem at in voluptas aliquid dolorum."
      ]
    },
    {
      title: "Laboriosam asperiores eum?",
      content: [
        "Aut necessitatibus maxime quis dolor et. Nemo qui quis harum enim sed. Aliquam molestias pariatur delectus voluptas. Vel aut minus labore at rerum eos."
      ]
    }
  ];

  return (
    <div className="card" style={{color:'#333'}}>
      <p className="card-title"><strong style={{color:'#012970'}}>GENERAL INSTRUCTION & GUIDELINES FOR FILLING COMPLAINT</strong></p>
      {sections.map((section, index) => (
        <div key={index}>
          <p
            onClick={() => toggleContent(index)}
            style={{ cursor: 'pointer' }}
          >
            {section.title}
          </p>
          {visibleIndex === index &&
            section.content.map((line, i) => (
              <span key={i} style={{ marginBottom: '8px' }}>{line}</span>
            ))
          }
          <hr />
        </div>
      ))}
    </div>
  );
};

export default InstructionCard;
