// 'use client';
// import { useState } from 'react';
// import PropTypes from 'prop-types';
// import { useMutation } from '@tanstack/react-query';
// import { useSelector } from 'react-redux';
// import Link from 'next/link';
// import { useRouter } from '@bprogress/next';
// import { toast } from 'react-hot-toast';
// import dynamic from 'next/dynamic';

// // mui
// import { Box, Card, Typography, Stack, IconButton, useMediaQuery, Tooltip, Skeleton, Zoom, Chip } from '@mui/material';
// // components
// import { useDispatch } from 'src/redux';
// import { setWishlist } from 'src/redux/slices/wishlist';
// import { addCompareProduct, removeCompareProduct } from '../../redux/slices/compare';

// import BlurImage from '@/components/blur-image';
// // hooks
// import { useCurrencyConvert } from '@/hooks/use-currency';
// import { useCurrencyFormat } from '@/hooks/use-currency-format';
// // api
// import * as api from 'src/services';
// // utils
// import { getPricingInfo } from '@/utils/pricing-utils';
// // icons
// import { IoMdHeartEmpty } from 'react-icons/io';
// import { GoEye } from 'react-icons/go';
// import { GoGitCompare } from 'react-icons/go';
// import { IoIosHeart } from 'react-icons/io';
// import { FaRegStar } from 'react-icons/fa';
// // dynamic
// const ProductDetailsDialog = dynamic(() => import('../dialog/product-details'));

// export default function ShopProductCard({ ...props }) {
//   const { product, loading } = props;
//   const cCurrency = useCurrencyConvert();
//   const fCurrency = useCurrencyFormat();

//   const [open, setOpen] = useState(false);
//   const [openActions, setOpenActions] = useState(false);
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const { wishlist } = useSelector(({ wishlist }) => wishlist);
//   const { user } = useSelector(({ user }) => user);
//   const { products: compareProducts } = useSelector(({ compare }) => compare);
//   const isNotUser = user?.role === 'vendor' || user?.role?.includes('admin');

//   const { isAuthenticated } = useSelector(({ user }) => user);
//   const isTablet = useMediaQuery('(max-width:900px)');
//   const [isLoading, setLoading] = useState(false);
//   const [quickViewLoading, setQuickViewLoading] = useState(false);
//   const [quickViewData, setQuickViewData] = useState(null);

//   const handleQuickView = async (event) => {
//     event.stopPropagation();
//     setQuickViewLoading(true);
//     try {
//       const data = await api.getProductBySlug(product.slug);
//       setQuickViewData(data);
//       setOpen(true);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to load product details');
//     } finally {
//       setQuickViewLoading(false);
//     }
//   };

//   const { mutate } = useMutation({
//     mutationFn: api.updateWishlist,
//     onSuccess: (data) => {
//       toast.success(data.message);
//       setLoading(false);
//       dispatch(setWishlist(data.data));
//     },
//     onError: (err) => {
//       setLoading(false);
//       const message = JSON.stringify(err?.response?.data?.message);
//       toast.error(message ? t('common:' + JSON.parse(message)) : t('common:something-wrong'));
//     }
//   });

//   const { name, slug, images, _id } = !loading && product;
//   const linkTo = `/product/${slug ? slug : ''}${product?.variant ? `?variant=${product.variant}` : ''}`;

//   const onClickWishList = async (event) => {
//     if (isNotUser) {
//       toast.error('Only user can add to wishlist');
//       return;
//     }
//     if (!isAuthenticated) {
//       event.stopPropagation();
//       router.push('/auth/sign-in');
//     } else {
//       event.stopPropagation();
//       setLoading(true);
//       await mutate(_id);
//     }
//   };

//   const onAddCompare = async (event) => {
//     if (isNotUser) {
//       toast.error('Only user can add to compare');
//       return;
//     }
//     event.stopPropagation();
//     toast.success('Added to compare list');
//     dispatch(addCompareProduct(product._id));
//   };

//   const onRemoveCompare = async (event) => {
//     event.stopPropagation();
//     toast.success('Removed from compare list');
//     dispatch(removeCompareProduct(_id));
//   };

//   // Discount calculation — avoid "-0%"
//   const pricingInfo = getPricingInfo(product);
//   const { salePrice, regularPrice, discountPercent, shouldShow } = pricingInfo;

//   return (
//     <Card
//       onMouseEnter={() => !isLoading && setOpenActions(true)}
//       onMouseLeave={() => setOpenActions(false)}
//       sx={{ display: 'block' }}
//     >
//       <Box sx={{ position: 'relative' }}>
//         {/* Out of Stock Badge */}
//         {!loading && product?.stockQuantity < 1 && (
//           <Chip
//             size="small"
//             sx={{
//               top: isTablet ? 6 : 8,
//               left: isTablet ? 6 : 8,
//               zIndex: 9,
//               position: 'absolute',
//               textTransform: 'uppercase',
//               fontSize: isTablet ? 7 : 10
//             }}
//             label="Out of Stock"
//             color="error"
//           />
//         )}

//         {/* Product Image — 4:3 ratio (smaller than original 1:1) */}
//         <Box
//           {...(!loading &&
//             product?.stockQuantity > 0 && {
//               component: Link,
//               href: linkTo
//             })}
//           sx={{
//             bgcolor: isLoading || loading ? 'transparent' : 'common.white',
//             position: 'relative',
//             cursor: 'pointer',
//             aspectRatio: '4 / 3',
//             '&:after': { content: `""`, display: 'block', paddingBottom: '75%' },
//             width: '100%',
//             img: { objectFit: 'cover' }
//           }}
//         >
//           {loading ? (
//             <Skeleton variant="rectangular" width="100%" sx={{ height: '100%', position: 'absolute' }} />
//           ) : (
//             <BlurImage alt={name} src={images[0].url} fill draggable="false" sizes="(max-width: 600px) 100vw, 50vw" />
//           )}
//         </Box>

//         {/* Hover Actions */}
//         <Zoom in={openActions}>
//           <Box>
//             <Stack
//               direction="row"
//               sx={{
//                 position: 'absolute',
//                 bottom: 6,
//                 left: '50%',
//                 transform: 'translate(-50%, 0px)',
//                 bgcolor: 'background.paper',
//                 borderRadius: '27px',
//                 p: '2px',
//                 zIndex: 11
//               }}
//             >
//               <Tooltip title="Quick View">
//                 <span>
//                   <IconButton
//                     aria-label="Quick View"
//                     disabled={loading || product?.stockQuantity < 1 || quickViewLoading}
//                     onClick={handleQuickView}
//                     size="small"
//                   >
//                     {quickViewLoading ? <Skeleton variant="circular" width={18} height={18} /> : <GoEye size={14} />}
//                   </IconButton>
//                 </span>
//               </Tooltip>

//               {wishlist?.filter((v) => v === _id).length > 0 ? (
//                 <Tooltip title="Remove from wishlist">
//                   <IconButton disabled={isLoading} onClick={onClickWishList} aria-label="Remove from wishlist" color="primary" size="small">
//                     <IoIosHeart size={14} />
//                   </IconButton>
//                 </Tooltip>
//               ) : (
//                 <Tooltip title="Add to wishlist">
//                   <IconButton disabled={isLoading} onClick={onClickWishList} aria-label="Add to wishlist" size="small">
//                     <IoMdHeartEmpty size={14} />
//                   </IconButton>
//                 </Tooltip>
//               )}

//               {compareProducts?.filter((v) => v._id === _id).length > 0 ? (
//                 <Tooltip title="Remove from compare">
//                   <IconButton disabled={isLoading} onClick={onRemoveCompare} aria-label="Remove from compare" color="primary" size="small">
//                     <GoGitCompare size={14} />
//                   </IconButton>
//                 </Tooltip>
//               ) : (
//                 <Tooltip title="Add to compare">
//                   <IconButton disabled={isLoading} onClick={onAddCompare} aria-label="Add to compare" size="small">
//                     <GoGitCompare size={14} />
//                   </IconButton>
//                 </Tooltip>
//               )}
//             </Stack>
//           </Box>
//         </Zoom>
//       </Box>

//       {/* Card Info */}
//       <Stack
//         justifyContent="center"
//         sx={{
//           zIndex: 111,
//           p: 0.75,
//           width: '100%',
//           a: { color: 'text.primary', textDecoration: 'none' }
//         }}
//       >
//         {/* Product Name */}
//         <Box sx={{ display: 'grid' }}>
//           <Typography
//             sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
//             {...(product?.stockQuantity > 0 && { component: Link, href: linkTo })}
//             variant="body2"
//             noWrap
//           >
//             {loading ? <Skeleton variant="text" width={100} /> : name}
//             {product?.variant ? ' | ' + product?.variant.split('/').join(' | ').toUpperCase() : ''}
//           </Typography>
//         </Box>

//         {/* Rating */}
//         <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
//           <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//             {loading ? (
//               <Skeleton variant="text" width={60} />
//             ) : (
//               <>
//                 <FaRegStar size={11} /> ({product.averageRating?.toFixed(1) || 0})
//               </>
//             )}
//           </Typography>
//         </Stack>

//         {/* Price */}
//         <Stack spacing={0.5} direction="row" justifyContent="space-between" alignItems="center">
//           <Stack direction="row" alignItems="center" spacing={0.75}>
//             <Typography
//               variant="body2"
//               component="span"
//               sx={{
//                 fontWeight: 700,
//                 color: '#1a1a1a'
//               }}
//             >
//               {loading ? (
//                 <Skeleton variant="text" width={80} />
//               ) : (
//                 fCurrency(cCurrency(salePrice))
//               )}
//             </Typography>
//             {!loading && shouldShow && (
//               <Typography
//                 variant="body2"
//                 component="span"
//                 sx={{
//                   fontSize: { md: 12, xs: 11 },
//                   color: '#aaa',
//                   textDecoration: 'line-through'
//                 }}
//               >
//                 {fCurrency(cCurrency(regularPrice))}
//               </Typography>
//             )}
//           </Stack>
//         </Stack>
//       </Stack>

//       {open && quickViewData && (
//         <ProductDetailsDialog
//           product={quickViewData}
//           slug={product.slug}
//           open={open}
//           isSimpleProduct={product.type === 'simple'}
//           onClose={() => setOpen(false)}
//         />
//       )}
//     </Card>
//   );
// }

// ShopProductCard.propTypes = {
//   product: PropTypes.shape({
//     _id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     slug: PropTypes.string,
//     sku: PropTypes.string,
//     status: PropTypes.string,
//     images: PropTypes.array.isRequired,
//     price: PropTypes.number.isRequired,
//     salePrice: PropTypes.number,
//     stockQuantity: PropTypes.number,
//     colors: PropTypes.array,
//     averageRating: PropTypes.number
//   }),
//   loading: PropTypes.bool.isRequired
// };


'use client';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from '@bprogress/next';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// mui
import { Box, Card, Typography, Stack, IconButton, useMediaQuery, Tooltip, Skeleton, Zoom, Chip, Button } from '@mui/material';
// components
import { useDispatch } from 'src/redux';
import { setWishlist } from 'src/redux/slices/wishlist';
import { addCart } from 'src/redux/slices/product';
import { addCompareProduct, removeCompareProduct } from '../../redux/slices/compare';

import BlurImage from '@/components/blur-image';
// hooks
import { useCurrencyConvert } from '@/hooks/use-currency';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
// api
import * as api from 'src/services';
// utils
import { getPricingInfo } from '@/utils/pricing-utils';
// icons
import { IoMdHeartEmpty } from 'react-icons/io';
import { GoEye } from 'react-icons/go';
import { GoGitCompare } from 'react-icons/go';
import { IoIosHeart } from 'react-icons/io';
import { FaRegStar } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
// dynamic
const ProductDetailsDialog = dynamic(() => import('../dialog/product-details'));

export default function ShopProductCard({ ...props }) {
  const { product, loading } = props;
  const cCurrency = useCurrencyConvert();
  const fCurrency = useCurrencyFormat();

  const [open, setOpen] = useState(false);
  const [openActions, setOpenActions] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const { wishlist } = useSelector(({ wishlist }) => wishlist);
  const { user } = useSelector(({ user }) => user);
  const { products: compareProducts } = useSelector(({ compare }) => compare);
  const { checkout } = useSelector(({ product }) => product);
  const isNotUser = user?.role === 'vendor' || user?.role?.includes('admin');

  const { isAuthenticated } = useSelector(({ user }) => user);
  const isTablet = useMediaQuery('(max-width:900px)');
  const [isLoading, setLoading] = useState(false);
  const [isAddingToCart, setAddingToCart] = useState(false);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [quickViewData, setQuickViewData] = useState(null);

  const handleQuickView = async (event) => {
    event.stopPropagation();
    setQuickViewLoading(true);
    try {
      const data = await api.getProductBySlug(product.slug);
      setQuickViewData(data);
      setOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load product details');
    } finally {
      setQuickViewLoading(false);
    }
  };

  const { mutate } = useMutation({
    mutationFn: api.updateWishlist,
    onSuccess: (data) => {
      toast.success(data.message);
      setLoading(false);
      dispatch(setWishlist(data.data));
    },
    onError: (err) => {
      setLoading(false);
      const message = JSON.stringify(err?.response?.data?.message);
      toast.error(message ? t('common:' + JSON.parse(message)) : t('common:something-wrong'));
    }
  });

  const { name, slug, images, _id } = !loading && product;
  const linkTo = `/product/${slug ? slug : ''}${product?.variant ? `?variant=${product.variant}` : ''}`;

  const onClickWishList = async (event) => {
    if (isNotUser) {
      toast.error('Only user can add to wishlist');
      return;
    }
    if (!isAuthenticated) {
      event.stopPropagation();
      router.push('/auth/sign-in');
    } else {
      event.stopPropagation();
      setLoading(true);
      await mutate(_id);
    }
  };

  const onAddCompare = async (event) => {
    if (isNotUser) {
      toast.error('Only user can add to compare');
      return;
    }
    event.stopPropagation();
    toast.success('Added to compare list');
    dispatch(addCompareProduct(product._id));
  };

  const onRemoveCompare = async (event) => {
    event.stopPropagation();
    toast.success('Removed from compare list');
    dispatch(removeCompareProduct(_id));
  };

  // Discount calculation — avoid "-0%"
  const pricingInfo = getPricingInfo(product);
  const { salePrice, regularPrice, discountPercent, shouldShow } = pricingInfo;

  const isOutOfStock = !loading && product?.stockQuantity < 1;
  const hasVariants = !loading && product?.type !== 'simple';

  const handleAddToCart = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (isNotUser) {
      toast.error('Only user can add to cart');
      return;
    }
    if (!isAuthenticated) {
      router.push('/auth/sign-in?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (isOutOfStock) {
      return;
    }
    // ✅ Variant products need a variant chosen first — send to the product page instead
    if (hasVariants) {
      router.push(linkTo);
      return;
    }

    const alreadyInCart = checkout?.cart?.some((item) => item.sku === product.sku);
    if (alreadyInCart) {
      toast.error('Product is already in cart');
      return;
    }

    setAddingToCart(true);
    dispatch(
      addCart({
        pid: product._id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        stockQuantity: product.stockQuantity,
        type: product.type,
        deliveryType: product.deliveryType,
        ...(product.deliveryType === 'digital' && { downloadLink: product.downloadLink }),
        image: images?.[0]?.url,
        quantity: 1,
        discount: product.price - product.salePrice,
        price: salePrice,
        subtotal: salePrice
      })
    );
    toast.success('Added to cart');
    setAddingToCart(false);
  };

  return (
    <Card
      onMouseEnter={() => !isLoading && setOpenActions(true)}
      onMouseLeave={() => setOpenActions(false)}
      sx={{ display: 'block' }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Out of Stock Badge */}
        {!loading && product?.stockQuantity < 1 && (
          <Chip
            size="small"
            sx={{
              top: isTablet ? 6 : 8,
              left: isTablet ? 6 : 8,
              zIndex: 9,
              position: 'absolute',
              textTransform: 'uppercase',
              fontSize: isTablet ? 7 : 10
            }}
            label="Out of Stock"
            color="error"
          />
        )}

        {/* Product Image — 4:3 ratio (smaller than original 1:1) */}
        <Box
          {...(!loading &&
            product?.stockQuantity > 0 && {
            component: Link,
            href: linkTo
          })}
          sx={{
            bgcolor: isLoading || loading ? 'transparent' : 'common.white',
            position: 'relative',
            cursor: 'pointer',
            aspectRatio: '4 / 3',
            '&:after': { content: `""`, display: 'block', paddingBottom: '75%' },
            width: '100%',
            img: { objectFit: 'cover' }
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" width="100%" sx={{ height: '100%', position: 'absolute' }} />
          ) : (
            <BlurImage alt={name} src={images[0].url} fill draggable="false" sizes="(max-width: 600px) 100vw, 50vw" />
          )}
        </Box>

        {/* Hover Actions */}
        <Zoom in={openActions}>
          <Box>
            <Stack
              direction="row"
              sx={{
                position: 'absolute',
                bottom: 6,
                left: '50%',
                transform: 'translate(-50%, 0px)',
                bgcolor: 'background.paper',
                borderRadius: '27px',
                p: '2px',
                zIndex: 11
              }}
            >
              <Tooltip title="Quick View">
                <span>
                  <IconButton
                    aria-label="Quick View"
                    disabled={loading || product?.stockQuantity < 1 || quickViewLoading}
                    onClick={handleQuickView}
                    size="small"
                  >
                    {quickViewLoading ? <Skeleton variant="circular" width={18} height={18} /> : <GoEye size={14} />}
                  </IconButton>
                </span>
              </Tooltip>

              {wishlist?.filter((v) => v === _id).length > 0 ? (
                <Tooltip title="Remove from wishlist">
                  <IconButton disabled={isLoading} onClick={onClickWishList} aria-label="Remove from wishlist" color="primary" size="small">
                    <IoIosHeart size={14} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Add to wishlist">
                  <IconButton disabled={isLoading} onClick={onClickWishList} aria-label="Add to wishlist" size="small">
                    <IoMdHeartEmpty size={14} />
                  </IconButton>
                </Tooltip>
              )}

              {compareProducts?.filter((v) => v._id === _id).length > 0 ? (
                <Tooltip title="Remove from compare">
                  <IconButton disabled={isLoading} onClick={onRemoveCompare} aria-label="Remove from compare" color="primary" size="small">
                    <GoGitCompare size={14} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Add to compare">
                  <IconButton disabled={isLoading} onClick={onAddCompare} aria-label="Add to compare" size="small">
                    <GoGitCompare size={14} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Zoom>
      </Box>

      {/* Card Info */}
      <Stack
        justifyContent="center"
        sx={{
          zIndex: 111,
          p: 0.75,
          width: '100%',
          a: { color: 'text.primary', textDecoration: 'none' }
        }}
      >
        {/* Product Name */}
        <Box sx={{ display: 'grid' }}>
          <Typography
            sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
            {...(product?.stockQuantity > 0 && { component: Link, href: linkTo })}
            variant="body2"
            noWrap
          >
            {loading ? <Skeleton variant="text" width={100} /> : name}
            {product?.variant ? ' | ' + product?.variant.split('/').join(' | ').toUpperCase() : ''}
          </Typography>
        </Box>

        {/* Rating */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {loading ? (
              <Skeleton variant="text" width={60} />
            ) : (
              <>
                <FaRegStar size={11} /> ({product.averageRating?.toFixed(1) || 0})
              </>
            )}
          </Typography>
        </Stack>

        {/* Price + Add to Cart */}
        <Stack spacing={0.5} direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a'
              }}
            >
              {loading ? (
                <Skeleton variant="text" width={80} />
              ) : (
                fCurrency(cCurrency(salePrice))
              )}
            </Typography>
            {!loading && shouldShow && (
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontSize: { md: 12, xs: 11 },
                  color: '#aaa',
                  textDecoration: 'line-through'
                }}
              >
                {fCurrency(cCurrency(regularPrice))}
              </Typography>
            )}
          </Stack>

          {!loading && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              disabled={isOutOfStock || isAddingToCart}
              onClick={handleAddToCart}
              startIcon={<FiShoppingCart size={12} />}
              sx={{
                flexShrink: 0,
                fontSize: 10,
                lineHeight: 1.2,
                py: 0.25,
                px: 0.75,
                minWidth: 0,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& .MuiButton-startIcon': { mr: 0.4, display: 'flex', alignItems: 'center' }
              }}
            >
              {isOutOfStock ? 'Out of Stock' : hasVariants ? 'Select Options' : 'Add to Cart'}
            </Button>
          )}
        </Stack>
      </Stack>

      {open && quickViewData && (
        <ProductDetailsDialog
          product={quickViewData}
          slug={product.slug}
          open={open}
          isSimpleProduct={product.type === 'simple'}
          onClose={() => setOpen(false)}
        />
      )}
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    sku: PropTypes.string,
    status: PropTypes.string,
    images: PropTypes.array.isRequired,
    price: PropTypes.number.isRequired,
    salePrice: PropTypes.number,
    stockQuantity: PropTypes.number,
    colors: PropTypes.array,
    averageRating: PropTypes.number
  }),
  loading: PropTypes.bool.isRequired
};