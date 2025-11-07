import { motion } from 'framer-motion';

type Props = {
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
};

const ServiceCard = ({ title, description, price, duration, image }: Props) => (
  <motion.article
    whileHover={{ y: -4 }}
    className="group flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-lg shadow-slate-200/40 transition dark:border-slate-800 dark:bg-slate-900/80"
  >
    <img src={image} alt="SalonNova Service" className="h-40 w-full object-cover" loading="lazy" />
    <div className="flex flex-1 flex-col gap-2 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mt-auto flex items-center justify-between text-sm font-medium">
        <span>{duration}</span>
        <span className="text-brand">{price}</span>
      </div>
    </div>
  </motion.article>
);

export default ServiceCard;
