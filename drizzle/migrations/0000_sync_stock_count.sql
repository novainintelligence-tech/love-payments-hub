CREATE OR REPLACE FUNCTION public.sync_product_stock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid bigint;
BEGIN
  FOR pid IN SELECT DISTINCT x FROM unnest(ARRAY[
    CASE WHEN TG_OP <> 'INSERT' THEN OLD.product_id END,
    CASE WHEN TG_OP <> 'DELETE' THEN NEW.product_id END]) AS x WHERE x IS NOT NULL
  LOOP
    UPDATE public.products SET stock_count = (
      SELECT count(*) FROM public.product_keys WHERE product_id = pid AND NOT is_sold)
    WHERE id = pid;
  END LOOP;
  RETURN NULL;
END; $$;

REVOKE EXECUTE ON FUNCTION public.sync_product_stock() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_product_keys_stock ON public.product_keys;
CREATE TRIGGER trg_product_keys_stock
AFTER INSERT OR UPDATE OF is_sold, product_id OR DELETE ON public.product_keys
FOR EACH ROW EXECUTE FUNCTION public.sync_product_stock();

UPDATE public.products p SET stock_count = (
  SELECT count(*) FROM public.product_keys k WHERE k.product_id = p.id AND NOT k.is_sold)
WHERE p.product_type = 'key';