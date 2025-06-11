import React, { useState } from 'react';

const LaborumCard = () => {
  const [visibleIndex, setVisibleIndex] = useState(null);

  const toggleContent = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  const sections = [
    {
      title: "Debitis adipisci eius ?",
      content: "Ut quasi odit odio totam accusamus vero eius. Nostrum asperiores voluptatem eos nulla ab dolores est asperiores iure. Quo est quis praesentium aut maiores. Corrupti sed aut expedita fugit vero dolorem. Nemo rerum sapiente. A quaerat dignissimos."
    },
    {
      title: "Omnis fugiat quis repellendus ?",
      content: "In minus quia impedit est quas deserunt deserunt et. Nulla non quo dolores minima fugiat aut saepe aut inventore. Qui nesciunt odio officia beatae iusto sed voluptatem possimus quas. Officia vitae sit voluptatem nostrum a."
    },
    {
      title: "Et occaecati praesentium aliquam modi incidunt ?",
      content: "Voluptates magni amet enim perspiciatis atque excepturi itaque est. Sit beatae animi incidunt eum repellat sequi ea saepe inventore. Id et vel et et. Nesciunt itaque corrupti quia ducimus. Consequatur maiores voluptatum fuga quod ut non fuga."
    },
    {
      title: "Quo unde eaque vero dolor quis ipsam ?",
      content: "Numquam ut reiciendis aliquid. Quia veritatis quasi ipsam sed quo ut eligendi et non. Doloremque sed voluptatem at in voluptas aliquid dolorum."
    },
    {
      title: "Natus sunt quo mollitia accusamus ?",
      content: "Aut necessitatibus maxime quis dolor et. Nihil laboriosam molestiae qui molestias placeat corrupti non quo accusamus. Nemo qui quis harum enim sed. Aliquam molestias pariatur delectus voluptas quidem qui rerum id quisquam. Perspiciatis voluptatem voluptatem eos. Vel aut minus labore at rerum eos."
    }
  ];

  return (
    <div className="card">
      <p><strong>Laborum dolorem quam porro</strong></p>
      {sections.map((section, index) => (
        <div key={index}>
          <p onClick={() => toggleContent(index)} style={{ cursor: 'pointer' }}>
            {section.title}
          </p>
          {visibleIndex === index && (
            <span>{section.content}</span>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default LaborumCard;
