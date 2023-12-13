
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Card({ item }: { item: any; }) {
  return (
    <div className="card body">
      <h3>{item.title}</h3>
      <p>{item.title_fa}</p>
      <p>Price: {item.price_info.price}</p>
      <p>Change: {item.price_info.change}</p>
      <p>Min: {item.price_info.min}</p>
      <p>Max: {item.price_info.max}</p>
    </div>
  );
}

export default Card;
